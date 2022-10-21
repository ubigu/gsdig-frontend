import React from 'react';
import { IconButton, ListItemSecondaryAction, List, ListItem, ListItemText, Typography, Tooltip } from '@material-ui/core';
import { useTranslations } from '@src/translation/TranslationContext';
import { Edit as EditIcon, Delete as DeleteIcon, CenterFocusWeak as CenterFocusWeakIcon } from '@material-ui/icons';
import UnitDatasetMetadata from '@src/interfaces/UnitDatasetMetadata';
import ConfirmDialog from './ConfirmDialog';
import { lengthLimited } from '../utils/strings';
import { authRequest } from '@src/utils/request';
import { useKeycloak } from '@react-keycloak/web';
import UnitDatasetDialog from './UnitDatasetDialog';


interface Props {
  onZoomToExtent: (extent: number[]) => void;
}

export default function UnitDataList({
  onZoomToExtent
} : Props) {
  const { tr } = useTranslations();
  const { keycloak } = useKeycloak();

  const [unitDatasets, setUnitDatasets] = React.useState<UnitDatasetMetadata[]>([]);
  const [editValues, setEditValues] = React.useState<UnitDatasetMetadata>(null);
  const [toDelete, setToDelete] = React.useState<UnitDatasetMetadata>(null);

  const getUnitDatasets = async () => {
    authRequest<UnitDatasetMetadata[]>("/api/unitdata", keycloak).then(setUnitDatasets);
  }

  React.useEffect(() => {
    getUnitDatasets();
    return () => setUnitDatasets([]);
  }, [])

  const onSave = (unitDataset: UnitDatasetMetadata) => {
    authRequest<void>(`/api/unitdata/${unitDataset.uuid}`, keycloak, { method: "PUT", body: unitDataset })
    .then(() => setEditValues(null))
    .then(getUnitDatasets)
  }

  const onDelete = (uuid: string) => {
    authRequest<void>(`/api/unitdata/${uuid}`, keycloak, {
      method: "DELETE" 
    }).then(getUnitDatasets);
  }

  return (
    <div>
      <List>
        {unitDatasets.map(it =>
        <ListItem key={it.uuid}>
          <ListItemText primary={it.title} secondary={lengthLimited(it.description, 40) || ''} />
          <ListItemSecondaryAction>
            <Tooltip title={tr.Common.zoomToExtent}>
              <IconButton disabled={!it.extent} onClick={() => onZoomToExtent(it.extent)}>
                <CenterFocusWeakIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={tr.Common.edit}>
              <IconButton onClick={() => setEditValues(it)}>
                <EditIcon />
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
      {!!editValues &&
        <UnitDatasetDialog
          initial={editValues}
          onClose={() => setEditValues(null)}
          onSave={onSave}
        />
      }
      {toDelete &&
      <ConfirmDialog
        title={`${tr.Common.delete} ${toDelete.title}?`}
        onConfirm={(confirmed) => {
          if (confirmed) {
            onDelete(toDelete.uuid);
          }
          setToDelete(null);
        }}
      >
        <Typography>{`${tr.Common.deleteConfirmation} ${toDelete.title}?`}</Typography>
      </ConfirmDialog>
      }
    </div>
  )
}