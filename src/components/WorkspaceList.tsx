import React from 'react';
import { makeStyles, IconButton, TextField, FormGroup, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { useTranslations } from '@src/translation/TranslationContext';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, PlayArrow, Check as CheckIcon } from '@material-ui/icons';
import Workspace from '../interfaces/Workspace';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(2),
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtons: {
    marginLeft: 'auto',
  }
}));

interface Props {
  workspaces: Workspace[],
  selectedWorkspace: Workspace,
  onSelectWorkspace: (workspace: Workspace) => void
  onCreateWorkspace: (title: string) => void
  onEditWorkspace: (workspace: Workspace) => void
  onDeleteWorkspace: (workspace: Workspace) => void
}

export default function WorkspaceList({
  workspaces,
  selectedWorkspace,
  onSelectWorkspace,
  onCreateWorkspace,
  onEditWorkspace,
  onDeleteWorkspace,
} : Props) {
  const classes = useStyles();
  const { tr } = useTranslations();

  const [formValues, setFormValues] = React.useState<Workspace>(null);

  return (
    <div className={classes.container}>
      {workspaces.map(it =>
      <div key={it.uuid} className={classes.row}>
        {it.title}
        {selectedWorkspace && it.uuid === selectedWorkspace.uuid && <CheckIcon />}
        <div className={classes.editButtons}>
          <IconButton size="small" onClick={() => onSelectWorkspace(it)}>
            <PlayArrow />
          </IconButton>
          <IconButton size="small" onClick={() => setFormValues(it)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={() => onDeleteWorkspace(it)}>
            <DeleteIcon />
          </IconButton>
        </div>
      </div>
      )}
      {!!formValues &&
      <Dialog
        open={!!formValues}
      >
        <DialogTitle>
          Edit {formValues.title}
        </DialogTitle>
        <DialogContent>
          <FormGroup>
            <TextField
              id="title-input"
              name="title"
              label={tr.Common.title}
              type="text"
              value={formValues.title || ''}
              onChange={e => setFormValues({...formValues, title: e.target.value})}
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormValues(null)}>Cancel</Button>
          <Button
            onClick={() => {
              onEditWorkspace(formValues);
              setFormValues(null);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      }
      <IconButton size="small" onClick={() => onCreateWorkspace(tr.Workspace.defaultTitle)}>
        <AddIcon />
      </IconButton>
    </div>
  )
}