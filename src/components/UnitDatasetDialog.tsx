import React from 'react';
import { makeStyles, TextField, FormControlLabel, Checkbox, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormGroup, FormControl, MenuItem, InputLabel, Select, Typography } from '@material-ui/core';
import { useTranslations } from '@src/translation/TranslationContext';
import UnitDatasetMetadata from '@src/interfaces/UnitDatasetMetadata';

interface Props {
  initial?: UnitDatasetMetadata,
  onClose: () => void,
  onSave: (data: UnitDatasetMetadata) => void;  
}

const useStyles = makeStyles((theme) => ({
  subheading: {
    marginTop: theme.spacing(2)
  },
}));


export default function UnitDatasetDialog({
  initial,
  onClose,
  onSave,  
} : Props) {
  const classes = useStyles();
  const { tr } = useTranslations();

  const [data, setData] = React.useState<UnitDatasetMetadata>(initial);

  return (
    <Dialog
      open
      fullWidth
      onClose={onClose}
    >
      <DialogTitle>{data.title}</DialogTitle>
      <DialogContent>
        <FormGroup>
          <TextField
            name="title"
            label={tr.Common.title}
            type="text"
            value={data.title || ''}
            onChange={e => setData({...data, [e.target.name]: e.target.value})}
          />
          <TextField
            name="description"
            label={tr.Common.description}
            type="text"
            multiline
            value={data.description || ''}
            onChange={e => setData({...data, [e.target.name]: e.target.value})}
          />
          <TextField
            name="organization"
            label={tr.Common.organization}
            type="text"
            value={data.organization || ''}
            onChange={e => setData({...data, [e.target.name]: e.target.value})}
          />
          <FormControlLabel
            checked={data.publicity || false}
            onChange={(_, checked) => setData({...data, publicity: checked})}
            control={<Checkbox />}
            label={tr.Common.publicity}
          />
          <Typography className={classes.subheading}>{tr.Common.sensitivitySetting}</Typography>
          <FormControl>
            <InputLabel id={"sensi-setting-agg-type"}>{tr.Common.function}</InputLabel>
            <Select
              labelId={"sensi-setting-agg-type"}
              value={data.sensitivitySetting?.aggregate || ''}
              onChange={e => {
                const v = e.target.value as ("COUNT" | "MIN" | "MAX" | "SUM" | "AVG");
                setData(prev => (
                  {
                    ...prev,
                    sensitivitySetting: v ? { ...prev.sensitivitySetting, aggregate: v } : null
                  }
                ));
              }}
            >
              <MenuItem value={null}><em>None</em></MenuItem>
              <MenuItem value={"COUNT"}>Count</MenuItem>
              <MenuItem value={"MIN"}>Min</MenuItem>
              <MenuItem value={"MAX"}>Max</MenuItem>
              <MenuItem value={"AVG"}>Avg</MenuItem>
              <MenuItem value={"SUM"}>Sum</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel id={"sensi-setting-agg-property"}>{tr.Common.attribute}</InputLabel>
            <Select
              labelId={"sensi-setting-agg-property"}
              value={data.sensitivitySetting?.property || ''}
              onChange={e => {
                const v = e.target.value as string;
                setData(prev => (
                  {
                    ...prev,
                    sensitivitySetting: {
                      ...prev.sensitivitySetting,
                      property: v
                    }
                  }
                ));
              }}
            >
              {data.sensitivitySetting?.aggregate === 'COUNT' &&
              <MenuItem
                key={"sensi-setting-agg-property-item-groupcount"} value={null}
              >
                *
              </MenuItem>
              }
              {Object.keys(data.attributes).map((a, index) =>
              <MenuItem
                key={`sensi-setting-agg-property-item-${index}`}
                value={a}
              >
                {a}
              </MenuItem>
              )}
            </Select>
          </FormControl>
          <TextField
            label={tr.Common.value}
            value={data.sensitivitySetting?.minValue || ''}
            type="number"
            onChange={e => {
              const v = +e.target.value;
              setData(prev => (
                {
                  ...prev,
                  sensitivitySetting: {
                    ...prev.sensitivitySetting,
                    minValue: v
                  } 
                }
              ));
            }}
          />
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="secondary"
          onClick={onClose}
        >
          {tr.Common.cancel}
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => onSave(data)}
        >
          {tr.Common.save}
        </Button>
      </DialogActions>
    </Dialog>
  )
}