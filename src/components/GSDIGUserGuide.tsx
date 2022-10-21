import React from 'react';
import { Dialog, makeStyles, Typography } from '@material-ui/core';
import { useTranslations } from '@src/translation/TranslationContext';

interface Props {
  onClose: () => void,
}

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
  }
}));

export default function GSDIGUserGuide({
  onClose
} : Props) {
  const { tr } = useTranslations();
  const classes = useStyles();

  return (
    <Dialog
      fullWidth
      open
      onClose={onClose}
    >
      <div className={classes.container}>
        <Typography
          variant='body1'
          style={{ whiteSpace: "pre-line" }}
        >
          {tr.UserGuide.body}
        </Typography>
      </div>
    </Dialog>
  )
}
