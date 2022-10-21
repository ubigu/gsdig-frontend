import React from 'react';
import { makeStyles, Tooltip, Fab } from '@material-ui/core';
import { ZoomIn } from '@material-ui/icons';
import { useTranslations } from '@src/translation/TranslationContext';

const useStyles = makeStyles(() => ({
  zoomin: {
    cursor: 'zoom-in'
  },
}));

interface Props {
  onClick: () => void
}

export default function ZoomInControl({ onClick } : Props) {
  const classes = useStyles();
  const { tr } = useTranslations();
  return (
    <Tooltip arrow title={tr.Zoom.zoomIn}>
      <span>
        <Fab
          className={classes.zoomin}
          color="primary"
          onClick={onClick}
        >
          <ZoomIn fontSize="large" />
        </Fab>
      </span>
    </Tooltip>
  )
}