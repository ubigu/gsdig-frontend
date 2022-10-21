import React from 'react';
import { TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormGroup } from '@material-ui/core';

interface Props {
  propertyNames: string[],
  onCancel: () => void
  onSubmit: (properties: any) => void  
}

export default function MergeFeaturesDialog({ propertyNames, onCancel, onSubmit } : Props) {
  const [values, setValues] = React.useState(() => {
    const obj: any = {};
    propertyNames.forEach(key => obj[key] = null);
    return obj;
  });
  return (
    <Dialog open onClose={onCancel}>
      <DialogTitle>
        Merge features
      </DialogTitle>
      <DialogContent>
        <FormGroup>
          {Object.entries(values).map(([k, v]) =>
          <TextField
            type="text"
            key={k}
            name={k}
            label={k}
            value={v}
            onChange={e => setValues({...values, [e.target.name]: e.target.value})}
          />
          )}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSubmit(values)}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}