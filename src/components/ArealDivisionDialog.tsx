import React from 'react';
import { TextField, FormGroup, FormControlLabel, Checkbox, Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText, ListItemSecondaryAction, Tooltip, IconButton, Paper, Typography } from '@material-ui/core';
import { Delete as DeleteIcon } from '@material-ui/icons';
import { useTranslations } from '@src/translation/TranslationContext';
import ArealDivisionMetadata from '../interfaces/ArealDivisionMetadata';
import AttributeInfo from '@src/interfaces/AttributeInfo';

interface Props {
  initial?: ArealDivisionMetadata,
  onClose: () => void,
  onSave: (data: ArealDivisionMetadata) => void;  
}

export default function ArealDivisionDialog({
  initial,
  onClose,
  onSave,
} : Props) {
  const { tr } = useTranslations();

  const [data, setData] = React.useState<ArealDivisionMetadata>(initial);
  
  const setTitle = (attribute: string, title: string) => {
    setData(p => ({ ...p, attributes: changeTitle(p.attributes, attribute, title) }))
  }

  const changeTitle = (prev: { [key: string]: AttributeInfo }, attribute: string, title: string): { [key: string]: AttributeInfo } => {
    const ret: { [key: string]: AttributeInfo } = {};
    Object.entries(prev).forEach(([name, info]) => {
      const item = { ...info, title: name === attribute ? title : info.title };
      console.log(item);
      ret[name] = item;
    });
    return ret;
  }

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
          <Typography>{tr.Common.attributes}</Typography>
          <List component={Paper}>
            {Object.entries(data.attributes).map(([attribute, info]) =>
            <ListItem key={attribute}>
              <ListItemText>
                <TextField
                  value={info.title || ''}
                  onChange={e => setTitle(attribute, e.target.value)}
                />
              </ListItemText>
              <ListItemSecondaryAction>
                <Tooltip title={tr.Common.delete}>
                  <IconButton
                    onClick={() => {
                      setData(p => ({
                        ...p,
                        attributes: Object.keys(p.attributes)
                          .filter(k => k !== attribute)
                          .reduce((res, k) =>  ({ ...res, [k]: p.attributes[k] }), {})
                      }))
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>  
            </ListItem>
            )}
          </List>
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