import React from 'react';
import { makeStyles, Dialog, List, ListItem, ListItemText, AppBar, Toolbar, IconButton, Typography, TextField, ListItemSecondaryAction } from '@material-ui/core';
import { Add as AddIcon, Close as CloseIcon, Clear as ClearIcon, Cancel as CancelIcon, Check as CheckIcon, Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { useTranslations } from '@src/translation/TranslationContext';
import Workspace from '../interfaces/Workspace';
import { authRequest } from '@src/utils/request';
import WorkspaceDefaults from '@src/interfaces/WorkspaceDefaults';
import { useKeycloak } from '@react-keycloak/web';
import NewWorkspace from '@src/interfaces/NewWorkspace';
import LayerSettings from '@src/interfaces/LayerSettings';

const useStyles = makeStyles((theme) => ({
  title: {
    marginLeft: theme.spacing(2),
  },
  search: {
    marginLeft: theme.spacing(2),
  }
}));

interface Props {
  handleClose: () => void
  selectedWorkspace?: Workspace,
  onSelectWorkspace: (workspace: Workspace) => void
}

export default function WorkspaceDialog({
  handleClose,
  selectedWorkspace,
  onSelectWorkspace
} : Props) {
  const classes = useStyles();
  const { tr } = useTranslations();
  const { keycloak } = useKeycloak();

  const [titleFilter, setTitleFilter] = React.useState<string>(undefined);
  const [editId, setEditId] = React.useState<string>(null);
  const [editTitle, setEditTitle] = React.useState<string>(null);
  const selectedWorkspaceUuid = selectedWorkspace?.uuid;

  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);

  const [defaultTitle, setDefaultTitle] = React.useState<string>("Default workspace title");
  const [defaultCenter, setDefaultCenter] = React.useState<number[]>([500000, 7340032]);
  const [defaultZoom, setDefaultZoom] = React.useState<number>(5);
  const [defaultBackgroundLayer, setDefaultBackgroundLayer] = React.useState<LayerSettings>(null);
  
  React.useEffect(() => {
    authRequest<WorkspaceDefaults>("/api/workspace-defaults", keycloak).then(it => {
      setDefaultTitle(it.title);
      setDefaultCenter(it.center);
      setDefaultZoom(it.zoom);
      setDefaultBackgroundLayer(it.backgroundLayer);
    });
    authRequest<Workspace[]>("/api/workspaces", keycloak).then(setWorkspaces);
    return () => setWorkspaces([])
  }, []);

  const onCreateWorkspace = () => {
    const workspace: NewWorkspace = {
      title: defaultTitle,
      center: defaultCenter,
      zoom: defaultZoom,
      backgroundLayers: [defaultBackgroundLayer],
    }
    authRequest<Workspace>("/api/workspaces", keycloak, {
        method: "POST",
        body: workspace
    }).then(it => {
      setWorkspaces(prev => [...prev, it]);
    });
  }

  const onEditWorkspaceTitle = (uuid: string, title: string) => {
    const workspace = workspaces.find(it => it.uuid === uuid);
    if (!workspace) {
      return;
    }

    authRequest<Workspace>(`/api/workspaces/${uuid}`, keycloak, {
      method: "PUT",
      body: {
        ...workspace,
        title: title
      }
    }).then(resp => setWorkspaces(prev => prev.map(p => p.uuid === resp.uuid ? resp : p)));
  }

  const onDeleteWorkspace = (workspace: Workspace) => {
    authRequest<void>(`/api/workspaces/${workspace.uuid}`, keycloak, {
      method: "DELETE"
    }).then(() => setWorkspaces(prev => prev.filter(p => p.uuid !== workspace.uuid)));
  }

  return (
    <Dialog open onClose={handleClose}>
      <AppBar position='sticky'>
        <Toolbar>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
          <Typography className={classes.title} variant="h6">
            {tr.WorkspaceDialog.title}
          </Typography>
          <TextField
            autoFocus
            className={classes.search}
            placeholder={tr.WorkspaceDialog.searchPlaceholder}
            value={titleFilter || ''}
            onChange={e => setTitleFilter(e.target.value)}
            InputProps={{
              endAdornment: titleFilter ? (
                <IconButton size="small" onClick={() => setTitleFilter(null)}>
                  <ClearIcon />
                </IconButton>
              ) : undefined
            }}
            style={{ flex: 1 }}
          />
          <IconButton onClick={onCreateWorkspace}>
            <AddIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <List>
        {workspaces.filter(it => !titleFilter || it.title.startsWith(titleFilter)).map(it =>
          it.uuid !== editId
          ?
          <ListItem
            key={it.uuid}
            selected={it.uuid === selectedWorkspaceUuid}
            button
            onClick={() => {
              onSelectWorkspace(it);
              handleClose();
            }}
          >
            <ListItemText>
              {it.title}
            </ListItemText>
            <ListItemSecondaryAction>
              <IconButton disabled>
                <CancelIcon />
              </IconButton>
              <IconButton disabled>
                <CheckIcon />
              </IconButton>
              <IconButton
                onClick={() => {
                  setEditId(it.uuid);
                  setEditTitle(it.title);
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => onDeleteWorkspace(it)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          :
          <ListItem
            key={it.uuid}
            selected={it.uuid === selectedWorkspaceUuid}
          >
            <ListItemText>
              <TextField
                value={editTitle || ''}
                onChange={e => setEditTitle(e.target.value)}
              />
            </ListItemText>
            <ListItemSecondaryAction>
              <IconButton onClick={() => setEditId(null)} >
                <CancelIcon />
              </IconButton>
              <IconButton
                onClick={() => {
                  onEditWorkspaceTitle(editId, editTitle);
                  setEditId(null);
                }}
              >
                <CheckIcon />
              </IconButton>
              <IconButton disabled>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => onDeleteWorkspace(it)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        )}
      </List>
    </Dialog>
  )
}