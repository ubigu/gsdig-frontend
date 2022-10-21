import React from 'react';
import FileDropZone from './FileDropzone';
import UploadFromURLDialog from './UploadFromURLDialog';
import ConfirmDialog from './ConfirmDialog';
import { useTranslations } from '@src/translation/TranslationContext';
import { CircularProgress, List, ListItem, ListItemSecondaryAction, ListItemText, IconButton, Typography, ListItemAvatar, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, makeStyles, Divider, Menu, Tooltip } from '@material-ui/core';
import { Delete as DeleteIcon, Storage, Publish, CloudUpload, Http } from '@material-ui/icons';
import { authRequest } from '@src/utils/request';
import { useKeycloak } from '@react-keycloak/web';
import ArealDivisionDialog from './ArealDivisionDialog';
import ArealDivisionMetadata from '@src/interfaces/ArealDivisionMetadata';
import UnitDatasetDialog from './UnitDatasetDialog';
import UnitDatasetMetadata from '@src/interfaces/UnitDatasetMetadata';
import SensitivitySetting from '@src/interfaces/SensitivitySetting';
import AttributeInfo from '@src/interfaces/AttributeInfo';

interface UploadInfo {
  uuid: string,
  typeName: string,
  extent: number[],
  srid: number,
  attributes: { [key: string]: string }
}

interface ImportCollection {
  type: 'arealdivision' | 'unitdata';
  title: string;
  description?: string,
  organization?: string,
  publicity?: boolean,  
  sensitivitySetting?: SensitivitySetting,
}

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(1),
  },
  button: {
    margin: theme.spacing(1)
  }
}));

export default function UploadManager() {
  const classes = useStyles();
  const { tr } = useTranslations();
  const { keycloak } = useKeycloak();

  const [uploaded, setUploaded] = React.useState<UploadInfo[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const [toDelete, setToDelete] = React.useState<UploadInfo>(null);

  const [urlDialogOpen, setUrlDialogOpen] = React.useState<boolean>(false);
  const [fileDialogOpen, setFileDialogOpen] = React.useState<boolean>(false);

  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);

  const [toImport, setToImport] = React.useState<UploadInfo>(null);
  const [importArealDivision, setImportArealDivision] = React.useState<ArealDivisionMetadata>(null);
  const [importUnitDataset, setImportUnitDataset] = React.useState<UnitDatasetMetadata>(null);

  const getUploads = () => {
    setLoading(true);
    authRequest<UploadInfo[]>("/api/uploads", keycloak)
    .then(setUploaded)
    .finally(() => setLoading(false));
  }

  React.useEffect(() => {
    getUploads();
  }, [])

  const onDelete = (uuid: string) => {
    authRequest<void>(`/api/uploads/${uuid}`, keycloak, { method: 'DELETE' }).then(getUploads);
  }

  const saveCollection = (uploadId: string, collection: ImportCollection) => {
    return authRequest<string>(`/api/uploads/${uploadId}/import`, keycloak, {
      method: "POST",
      body: collection
    });
  };

  const onSaveArealDivision = (data: ArealDivisionMetadata): void => {
    const uploadId = data.uuid;
    const importCollection : ImportCollection = {
      type: 'arealdivision',
      title: data.title,
      description: data.description,
      organization: data.organization,
      publicity: data.publicity
    }
    saveCollection(uploadId, importCollection)
    .then(() => setImportArealDivision(null))
    .then(getUploads);
  }

  const onSaveUnitDataset = (data: UnitDatasetMetadata): void => {
    const uploadId = data.uuid;
    const importCollection : ImportCollection = {
      type: 'unitdata',
      title: data.title,
      description: data.description,
      organization: data.organization,
      publicity: data.publicity,
      sensitivitySetting: data.sensitivitySetting
    }
    saveCollection(uploadId, importCollection)
    .then(() => setImportUnitDataset(null))
    .then(getUploads);
  }

  const mapAttributes = (attributes: { [key: string]: string }): { [key: string]: AttributeInfo } => {
    const ret: { [key: string]: AttributeInfo } = {};
    Object.entries(attributes).forEach(([name, binding]) => {
      const info: AttributeInfo = { title: name, binding: binding };
      ret[name] = info;
    });
    return ret;
  }

  return (
    <div>
      <div className={classes.container}>
        <Button
          className={classes.button}
          startIcon={<CloudUpload />}
          variant="outlined"
          color="primary"
          onClick={() => setFileDialogOpen(true)}
        >
          {tr.Import.fromFile}
        </Button>
        <Button
          className={classes.button}
          startIcon={<Http />}
          variant="outlined"
          color="primary"
          onClick={() => setUrlDialogOpen(true)}
        >
          {tr.Import.fromUrl}
        </Button>
      </div>
      <Divider />
      <List>
        { loading &&
        <ListItem>
          <CircularProgress />
        </ListItem>
        }
        {uploaded.map(it => 
        <ListItem dense key={it.uuid}>
          <ListItemAvatar>
            <Avatar>
              <Storage />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={it.typeName} />
          <ListItemSecondaryAction>
            <Tooltip title={tr.Import.publish}>
              <IconButton
                onClick={e => {
                  setToImport(it);
                  setAnchor(e.currentTarget);
                }}
              >
                <Publish />
              </IconButton>
            </Tooltip>
            <Tooltip title={tr.Common.delete}>
              <IconButton onClick={() => setToDelete(it)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </ListItemSecondaryAction>
        </ListItem>
        )}
      </List>

      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        MenuListProps={{
          role: 'listbox'
        }}
      >
        <MenuItem
          onClick={() => {
            setImportArealDivision({
              uuid: toImport.uuid,
              title: toImport.typeName,
              description: "",
              organization: "",
              publicity: false,
              extent: toImport.extent,
              attributes: mapAttributes(toImport.attributes)
            });
            setAnchor(null);
          }}
        >
          {tr.Import.publishAsArealDivision}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setImportUnitDataset({
              uuid: toImport.uuid,
              title: toImport.typeName,
              description: "",
              organization: "",
              publicity: false,
              extent: toImport.extent,
              attributes: toImport.attributes,
              sensitivitySetting: null
            });
            setAnchor(null);
          }}
        >
          {tr.Import.publishAsUnitDataset}
        </MenuItem>
      </Menu>

      {importArealDivision &&
      <ArealDivisionDialog
        initial={importArealDivision}
        onClose={() => setImportArealDivision(null)}
        onSave={onSaveArealDivision}
      />
      }

      {importUnitDataset &&
      <UnitDatasetDialog
        initial={importUnitDataset}
        onClose={() => setImportUnitDataset(null)}
        onSave={onSaveUnitDataset}
      />
      }

      {urlDialogOpen &&
      <UploadFromURLDialog
        onClose={() => setUrlDialogOpen(false)}
        onUpload={(info) => setUploaded(prev => [...prev, ...info])}
      />
      }

      {fileDialogOpen &&
      <Dialog
        open
        fullWidth
        onClose={() => setFileDialogOpen(false)}
      >
        <DialogTitle>{tr.Import.dropFile}</DialogTitle>
        <DialogContent>
          <FileDropZone
            label={tr.Import.formats}
            fileExtensions={[".gpkg", ".csv", ".geojson", ".json", ".zip", ".shp"]}
            handleImport={async (file) => {
              setLoading(true);
              const formData = new FormData();
              formData.append('file', file);
              fetch('/api/uploads', {
                method: 'POST',
                body: formData,
                headers: { Authorization: "Bearer " + keycloak.token }
              })
              .then(resp => resp.json())
              .then(data => setUploaded(prev => [...prev, ...data]))
              .finally(() => setLoading(false));
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFileDialogOpen(false)}>{tr.Common.cancel}</Button>
        </DialogActions>
      </Dialog>
      }

      {toDelete &&
      <ConfirmDialog
        title={`${tr.Common.delete} ${toDelete.typeName}?`}
        onConfirm={(confirmed) => {
          if (confirmed) {
            onDelete(toDelete.uuid);
          }
          setToDelete(null);
        }}
      >
        <Typography>{`${tr.Common.deleteConfirmation} ${toDelete.typeName}?`}</Typography>
      </ConfirmDialog>
      }
    </div>
  )
}
