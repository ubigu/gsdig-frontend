import React from 'react';
import { makeStyles } from '@material-ui/core';

interface Props {
  children: JSX.Element | JSX.Element[] 
}

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    bottom: theme.spacing(3),
    right: theme.spacing(2),
    '&> *': {
      marginRight: theme.spacing(1),
    }
  }
}));

export default function BottomRightControls({
  children
} : Props) {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      {children}
    </div>
  )
}