import React from 'react';
import { makeStyles } from '@material-ui/core';

interface Props {
  children: JSX.Element | JSX.Element[]
}

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    top: theme.spacing(2),
    left: theme.spacing(2),
    '&> *': {
      marginRight: theme.spacing(1),
    }
  }
}));

export default function TopLeftControls({
  children
} : Props) {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      {children}
    </div>
  )
}