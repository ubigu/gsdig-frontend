import React from 'react';
import { makeStyles, Paper, Tab, Tabs } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(2)
  },
  tab: {
    minWidth: 'auto',
  },
  tabContents: {
    flexGrow: 1,
    overflow: 'auto',
    marginTop: 1,
  },
}));

interface Props {
  titles: string[],
  children: JSX.Element[]
}

export default function TabContainer({
  titles,
  children
} : Props) {
  const classes = useStyles();
  
  const [currentTab, setCurrentTab] = React.useState(0);

  return (
    <div className={classes.container}>
      <Tabs
        value={currentTab}
        onChange={(_, value) => setCurrentTab(value)}
      >
        {titles.map(title =>
        <Tab
          key={`tab-title-${title}`}
          className={classes.tab}
          label={title}
        />
        )}
      </Tabs>
      <Paper className={classes.tabContents} elevation={2}>
        {children[currentTab]}
      </Paper>
    </div>
  )
}