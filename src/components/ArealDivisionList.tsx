import React from 'react';
import { IconButton, ListItemIcon, ListItemText, ListItemSecondaryAction, ListItem, List, Typography, Tooltip, Menu, MenuItem } from '@material-ui/core';
import { useTranslations } from '@src/translation/TranslationContext';
import { Edit as EditIcon, Delete as DeleteIcon, CenterFocusWeak as CenterFocusWeakIcon, FileCopy, MoreVert, Gesture } from '@material-ui/icons';
import ArealDivisionMetadata from '../interfaces/ArealDivisionMetadata';
import { lengthLimited } from '../utils/strings';
import { authRequest } from '@src/utils/request';
import ConfirmDialog from './ConfirmDialog';
import { useKeycloak } from '@react-keycloak/web';
import ArealDivisionDownload from './ArealDivisionDownload';
import ArealDivisionDialog from './ArealDivisionDialog';

interface Props {
  selected?: ArealDivisionMetadata,
  onSelect: (ad: ArealDivisionMetadata) => void,  
  onZoomToExtent: (extent: number[]) => void;
  onHighlightInvalid: (errors: { [featureId: string]: string }) => void;
}

export default function ArealDivisionList({
  selected,
  onSelect,
  onZoomToExtent,
  onHighlightInvalid
} : Props) {
  const { tr } = useTranslations();
  const { keycloak } = useKeycloak();

  const [arealDivisions, setArealDivisions] = React.useState<ArealDivisionMetadata[]>([]);
  const [toEdit, setToEdit] = React.useState<ArealDivisionMetadata>(null);
  const [toDelete, setToDelete] = React.useState<ArealDivisionMetadata>(null);

  const [moreAnchor, setMoreAnchor] = React.useState<null | HTMLElement>(null);
  const [moreItem, setMoreItem] = React.useState<ArealDivisionMetadata>(null);
  
  React.useEffect(() => {
    authRequest<ArealDivisionMetadata[]>("/api/arealdivisions", keycloak).then(setArealDivisions);
    return setArealDivisions([]);
  }, [])

  const clone = (arealDivision: ArealDivisionMetadata) => {
    authRequest<void>(`/api/arealdivisions/${arealDivision.uuid}/clone`, keycloak, {
      method: "POST"      
    })
    .then(() => authRequest<ArealDivisionMetadata[]>("/api/arealdivisions", keycloak))
    .then(setArealDivisions);
  }

  const validate = (arealDivision: ArealDivisionMetadata) => {
    authRequest<{ [featureId: string]: string }>(`/api/arealdivisions/${arealDivision.uuid}/validate`, keycloak, {
      method: "POST"
    })
    .then(onHighlightInvalid);
  }

  const onSave = (arealDivision: ArealDivisionMetadata) => {
    authRequest<void>(`/api/arealdivisions/${arealDivision.uuid}`, keycloak, {
      method: "PUT",
      body: arealDivision
    })
    .then(() => authRequest<ArealDivisionMetadata[]>("/api/arealdivisions", keycloak))
    .then(setArealDivisions);
  }

  const onDelete = (arealDivision: ArealDivisionMetadata) => {
    authRequest<void>(`/api/arealdivisions/${arealDivision.uuid}`, keycloak, {
      method: "DELETE" 
    })
    .then(() => authRequest<ArealDivisionMetadata[]>("/api/arealdivisions", keycloak))
    .then(setArealDivisions);
  }

  return (
    <div>
      <List>
        {arealDivisions.map(it =>
        <ListItem
          key={it.uuid}
          button
          onClick={() => onSelect(it)}
          selected={it.uuid === selected?.uuid}
        >
          <ListItemText primary={it.title} secondary={lengthLimited(it.description, 40) || ''} />
          <ListItemSecondaryAction>
            <ArealDivisionDownload collectionId={it.uuid} />
            <Tooltip title={tr.Common.zoomToExtent}>
              <IconButton disabled={!it.extent} onClick={() => onZoomToExtent(it.extent)}>
                <CenterFocusWeakIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={tr.Common.additionalFunctionality}>
              <IconButton onClick={(e) => {
                setMoreItem(it);
                setMoreAnchor(e.currentTarget);
              }}>
                <MoreVert />
              </IconButton>
            </Tooltip>
          </ListItemSecondaryAction>
        </ListItem>
        )}
      </List>
      <Menu
        anchorEl={moreAnchor}
        open={!!moreAnchor}
        onClose={() => setMoreAnchor(null)}
        MenuListProps={{ role: 'listbox' }}
      >
        <MenuItem
          disabled={moreItem !== selected}
          onClick={() => {
            validate(moreItem);
            setMoreAnchor(null);
            setMoreItem(null);
          }}
        >
          <ListItemIcon>
            <Gesture />
          </ListItemIcon>
          <ListItemText primary={tr.Common.validateGeometries} />
        </MenuItem>
        <MenuItem
          onClick={() => {
            clone(moreItem);
            setMoreAnchor(null);
            setMoreItem(null);
          }}
        >
          <ListItemIcon>
            <FileCopy />
          </ListItemIcon>
          <ListItemText primary={tr.Common.clone} />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setToEdit(moreItem);
            setMoreAnchor(null);
            setMoreItem(null);
          }}
        >
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText primary={tr.Common.edit} />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setToDelete(moreItem);
            setMoreAnchor(null);
            setMoreItem(null);
          }}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText primary={tr.Common.delete} />
        </MenuItem>
      </Menu>
      {toEdit &&
      <ArealDivisionDialog
        initial={toEdit}
        onClose={() => setToEdit(null)}
        onSave={(arealDivision: ArealDivisionMetadata) => {
          onSave(arealDivision);
          setToEdit(null);
        }}
      />
      }
      {toDelete &&
      <ConfirmDialog
        title={`${tr.Common.delete} ${toDelete.title}?`}
        onConfirm={(confirmed) => {
          if (confirmed) {
            onDelete(toDelete);
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