import React from 'react';
import { IconButton, TextField, FormGroup, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, InputLabel, Select, FormControl, ListItemSecondaryAction, ListItemText, ListItem, List, Switch, Typography, makeStyles, Divider } from '@material-ui/core';
import { useTranslations } from '@src/translation/TranslationContext';
import { AddCircle, Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import BackgroundLayer from '../interfaces/BackgroundLayer';
import ConfirmDialog from './ConfirmDialog';

interface Props {
  backgroundLayers: BackgroundLayer[],
  enabledLayers: string[],
  onToggle: (backgroundLayer: BackgroundLayer) => void
  onCreate: (backgroundLayer: BackgroundLayer) => void
  onEdit: (backgroundLayer: BackgroundLayer) => void
  onDelete: (backgroundLayer: BackgroundLayer) => void
}

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(1),
  },
  button: {
    margin: theme.spacing(1)
  }
}));

export default function BackgroundLayerList({
  backgroundLayers,
  enabledLayers,
  onToggle,
  onCreate,
  onEdit,
  onDelete,
} : Props) {
  const classes = useStyles();
  const { tr } = useTranslations();

  const [formValues, setFormValues] = React.useState<BackgroundLayer>(null);
  const [toDelete, setToDelete] = React.useState<BackgroundLayer>(null);

  return (
    <div>
      <div className={classes.container}>
        <Button
          className={classes.button}
          startIcon={<AddCircle />}
          variant="outlined"
          color="primary"
          onClick={() => setFormValues(
            {
              type: "wmts",
              title: tr.BackgroundLayer.defaultTitle,
              options: {}
            }
          )}
        >
          {tr.BackgroundLayer.defaultTitle}
        </Button>
      </div>
      <Divider />
      <List>
        {backgroundLayers.map(it =>
        <ListItem
          key={it.uuid}
          button
          onClick={() => onToggle(it)}
        >
          <Switch checked={enabledLayers.includes(it.uuid)} />
          <ListItemText primary={it.title} />
          <ListItemSecondaryAction>
            <IconButton onClick={() => setFormValues(it)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => setToDelete(it)}>
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
        )}
      </List>
      {toDelete &&
      <ConfirmDialog
        title={`Poista ${toDelete.title}`}
        onConfirm={(confirm) => {
          if (confirm) {
            onDelete(toDelete);
          }
          setToDelete(null);
        }}
      >
        <Typography>{`Haluatko varmasti poistaa ${toDelete.title} ?`}</Typography>
      </ConfirmDialog>
      }
      {formValues &&
      <Dialog
        open={!!formValues}
      >
        <DialogTitle>
          Edit {formValues.title}
        </DialogTitle>
        <DialogContent>
          <FormGroup>
            <TextField
              id="uuid-input"
              name="uuid"
              label={tr.Common.uuid}
              type="text"
              value={formValues.uuid || ''}
              disabled
            />
            <FormControl>
              <InputLabel id="type-select-label">{tr.Common.type}</InputLabel>
              <Select
                labelId="type-select-label"
                id="select"
                value={formValues.type || ''}
                onChange={e => setFormValues({...formValues, type: e.target.value as string})}
              >
                <MenuItem key={"wmts"} value={"wmts"}>WMTS</MenuItem>
              </Select>
            </FormControl>
            <TextField
              id="title-input"
              name="title"
              label={tr.Common.title}
              type="text"
              value={formValues.title || ''}
              onChange={e => setFormValues({...formValues, [e.target.name]: e.target.value})}
            />
            <TextField
              id="options-input"
              name="options"
              label={tr.Common.options}
              type="text"
              value={JSON.stringify(formValues.options || '{}')}
              onChange={e => setFormValues({...formValues, [e.target.name]: JSON.parse(e.target.value)})}
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormValues(null)}>{tr.Common.cancel}</Button>
          <Button
            onClick={() => {
              if (formValues.uuid) {
                onEdit(formValues);
              } else {
                onCreate(formValues);
              }
              setFormValues(null);
            }}
          >
            {tr.Common.save}
          </Button>
        </DialogActions>
      </Dialog>
      }
    </div>
  )
}