import React from 'react';
import { makeStyles, Tooltip, Fab } from '@material-ui/core';
import { ZoomOut } from '@material-ui/icons';
import { useTranslations } from '@src/translation/TranslationContext';

const useStyles = makeStyles(() => ({
  zoomout: {
    cursor: 'zoom-out'
  },
}));

interface Props {
  onClick: () => void
}

export default function ZoomOutControl({ onClick } : Props) {
  const classes = useStyles();
  const { tr } = useTranslations();
  return (
    <Tooltip arrow title={tr.Zoom.zoomOut}>
      <span>
        <Fab
          className={classes.zoomout}
          color="primary"
          onClick={onClick}
        >
          <ZoomOut fontSize="large" />
        </Fab>
      </span>
    </Tooltip>
  )
}