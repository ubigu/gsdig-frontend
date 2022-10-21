import React from 'react';
import { makeStyles } from '@material-ui/core';

interface Props {
  children: JSX.Element | JSX.Element[]
}

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    '&> *': {
      marginTop: theme.spacing(1),
    }
  }
}));

export default function TopRightControls({
  children
} : Props) {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      {children}
    </div>
  )
}