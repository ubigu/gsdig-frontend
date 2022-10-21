import React from 'react';
import { makeStyles, Paper, Tab, Tabs } from '@material-ui/core';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  tab: {
    minWidth: 'auto',
  },
  tabContents: {
    flexGrow: 1,
    overflow: 'auto',
    marginTop: 1,
  },
});

interface Props {
  titles: string[],
  children: JSX.Element[]
}

export default function SideBar({
  titles,
  children
}: Props) {
  const classes = useStyles();

  const [currentTab, setCurrentTab] = React.useState(0);

  return (
    <div className={classes.container}>
      <Paper square>
        <Tabs
          variant="fullWidth"
          value={currentTab}
          onChange={(_, value) => setCurrentTab(value)}
        >
          {titles.map(title =>
          <Tab
            key={"sidebar-tab-" + title}
            className={classes.tab}
            label={title}
          />
          )}
        </Tabs>
      </Paper>
      <div className={classes.tabContents}>
        {children[currentTab]}
      </div>
    </div>
  )
}
