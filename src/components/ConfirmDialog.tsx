import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { useTranslations } from '@src/translation/TranslationContext';

interface Props {
  title: string,
  children: JSX.Element | JSX.Element[],
  onConfirm: (confirmed: boolean) => void,
}

export default function ConfirmDialog({ title, children, onConfirm } : Props) {
  const { tr } = useTranslations();

  return (
    <Dialog
      open
      onClose={() => onConfirm(false)}
      aria-labelledby="confirm-dialog"
    >
      <DialogTitle id="confirm-dialog">{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => {
            console.log("Calling onConfirm with false");
            onConfirm(false);
          }}
        >
          {tr.Common.cancel}
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => {
            console.log("Calling onConfirm with true");
            onConfirm(true);
          }}
        >
          {tr.Common.yes}
        </Button>
      </DialogActions>
    </Dialog>
  )
}