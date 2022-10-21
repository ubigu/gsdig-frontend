import React from 'react';
import { makeStyles, TextField, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Checkbox, Button, Snackbar, CircularProgress } from '@material-ui/core';
import { useTranslations } from '@src/translation/TranslationContext';
import { Alert, Autocomplete } from '@material-ui/lab';
import ArealDivisionMetadata from '@src/interfaces/ArealDivisionMetadata';
import UnitDatasetMetadata from '@src/interfaces/UnitDatasetMetadata';
import JoinRequest from '@src/interfaces/JoinRequest';
import JoinAttribute from '@src/interfaces/JoinAttribute';
import { authRequest } from '@src/utils/request';
import { useKeycloak } from '@react-keycloak/web';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  autocomplete: {
    marginTop: theme.spacing(1),
  },
}));

interface CheckableProperty {
  checked: boolean,
  property: string
}

export default function JoinData() {
  const classes = useStyles();
  const { tr } = useTranslations();
  const { keycloak } = useKeycloak();

  const [title, setTitle] = React.useState<string>("");

  const [arealDivisions, setArealDivisions] = React.useState<ArealDivisionMetadata[]>([]);
  const [unitDatasets, setUnitDatasets] = React.useState<UnitDatasetMetadata[]>([]);

  const [selectedArealDivision, setSelectedArealDivision] = React.useState<ArealDivisionMetadata>(null);
  const [areaAttributes, setAreaAttributes] = React.useState<CheckableProperty[]>([]);
  
  const [additionalGroupingProperty, setAdditionalGroupingProperty] = React.useState<string>(null);

  const [selectedUnitDataset, setSelectedUnitDataset] = React.useState<UnitDatasetMetadata>(null);
  const [dataAttributes, setDataAttributes] = React.useState<JoinAttribute[]>([]);

  const [loading, setLoading] = React.useState<boolean>(false);
  const [notification, setNotification] = React.useState<string>(null);

  const onCreate = (joinRequest: JoinRequest) => {
    setLoading(true);
    authRequest<void>(`/api/joins`, keycloak, {
      method: "POST",
      body: joinRequest
    })
    .then(() => setNotification(`${joinRequest.title} lisätty jonoon`))
    .finally(() => setLoading(false));
  }
  
  React.useEffect(() => {
    authRequest<ArealDivisionMetadata[]>("/api/arealdivisions", keycloak).then(setArealDivisions);
    authRequest<UnitDatasetMetadata[]>("/api/unitdata", keycloak).then(setUnitDatasets);
    return () => {
      setArealDivisions([]);
      setUnitDatasets([]);
    }
  }, [])

  React.useEffect(() => {
    if (selectedArealDivision) {
      setAreaAttributes(Object.keys(selectedArealDivision.attributes).map(it => (
        {
          property: it,
          checked: true
        }
      )));
    }
  }, [selectedArealDivision]);

  React.useEffect(() => {
    if (selectedUnitDataset) {
      setDataAttributes(Object.keys(selectedUnitDataset.attributes).map(it => (
        {
          property: it,
          aggregate: []
        }
      )));
    } else {
      setDataAttributes([]);
    }
  }, [selectedUnitDataset]);

  return (
    <div className={classes.container}>
      <TextField
        className={classes.autocomplete}
        fullWidth
        id="title-input"
        name="title"
        label={tr.Common.title}
        type="text"
        value={title || ''}
        required
        onChange={e => setTitle(e.target.value)}
      />
      <Autocomplete
        className={classes.autocomplete}
        value={selectedArealDivision}
        onChange={(_, newValue) => setSelectedArealDivision(newValue as ArealDivisionMetadata)}
        options={arealDivisions}
        getOptionLabel={(option) => option.title}
        renderInput={(params) => <TextField required {...params} placeholder={tr.Join.selectArealDivision} />}
      />
      <Autocomplete
        className={classes.autocomplete}
        value={selectedUnitDataset}
        onChange={(_, newValue) => setSelectedUnitDataset(newValue as UnitDatasetMetadata) }
        options={unitDatasets}
        getOptionLabel={(option) => option.title}
        renderInput={(params) => <TextField required {...params} placeholder={tr.Join.selectUnitDataset} />}
      />
      <Autocomplete
        className={classes.autocomplete}
        disabled={!selectedUnitDataset}
        value={additionalGroupingProperty}
        onChange={(_, newValue) => setAdditionalGroupingProperty(newValue)}
        options={selectedUnitDataset ? Object.keys(selectedUnitDataset.attributes) : []}
        renderInput={(params) => <TextField {...params} placeholder={tr.Join.additionalGroupBy} />}
      />
      {!!dataAttributes.length &&
      <TableContainer className={classes.autocomplete}>
        <Table size={'small'}>
          <TableHead>
            <TableRow>
              <TableCell component="th">{tr.Common.attribute}</TableCell>
              {['MIN', 'MAX', 'SUM', 'AVG', 'COUNT'].map(agg =>
              <TableCell component="th" align="center" key={`header-${agg}`}>{agg}</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {dataAttributes.filter(attr => additionalGroupingProperty !== attr.property).map((attr, idx) =>
            <TableRow key={idx}>
              <TableCell>{attr.property}</TableCell>
              {['MIN', 'MAX', 'SUM', 'AVG', 'COUNT'].map(agg =>
              <TableCell padding="checkbox" align="center" key={`attr-${agg}`}>
                <Checkbox
                  checked={attr.aggregate.some(it => it === agg)}
                  onChange={(_, checked) =>
                    setDataAttributes(prev =>
                      prev.map(p => p !== attr
                        ? p
                        : {
                            ...p,
                            aggregate: checked
                              ? [...p.aggregate, agg as ('MIN' | 'MAX' | 'SUM' | 'AVG' | 'COUNT')]
                              : p.aggregate.filter(a => a !== agg)
                          }
                      )
                    )
                  }
                />
              </TableCell>
              )}
            </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      }
      <Button
        className={classes.autocomplete}
        variant="outlined"
        color="primary"
        onClick={() =>
          onCreate(
            {
              title: title,                  
              arealDivision: selectedArealDivision.uuid,
              areaAttributes: areaAttributes.filter(it => it.checked).map(it => it.property),
              unitDataset: selectedUnitDataset.uuid,
              dataAttributes: dataAttributes,
              additionalGroupingProperty: additionalGroupingProperty
            }
          )
        }
      >
        {tr.Join.create}
      </Button>
      {loading && <CircularProgress />}
      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ horizontal: "right", "vertical": "bottom" }}
      >
        <Alert onClose={() => setNotification(null)} severity="success">
          {notification}
        </Alert>
      </Snackbar>
    </div>
  )
}