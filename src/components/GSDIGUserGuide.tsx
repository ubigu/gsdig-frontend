import React from 'react';
import { makeStyles, Dialog, AppBar, Toolbar, IconButton, Tabs, Tab, Typography, DialogContent } from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';
import { useTranslations } from '@src/translation/TranslationContext';

interface Props {
  onClose: () => void,
}

const useStyles = makeStyles((theme) => ({
  tabContents: {
    padding: theme.spacing(1)
  },
}));

export default function GSDIGUserGuide({
  onClose
} : Props) {
  const { tr } = useTranslations();
  const classes = useStyles();

  const [currentTab, setCurrentTab] = React.useState(0);

  const titles = [
    tr.Common.mapControls,
    tr.SideBar.layers,
    tr.SideBar.arealdivision,
    tr.SideBar.features,
    tr.SideBar.unitdata,
    tr.SideBar.join,
    tr.SideBar.upload,
  ];

  const content = [
    tr.UserGuide.map,
    tr.UserGuide.layers,
    tr.UserGuide.arealdivision,
    tr.UserGuide.features,
    tr.UserGuide.unitdata,
    tr.UserGuide.join,
    tr.UserGuide.upload,
  ];

  return (
    <Dialog
      fullScreen
      open
      onClose={onClose}
    >
      <AppBar position='sticky'>
        <Toolbar>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
          <Typography>{tr.Common.userGuide}</Typography>
        </Toolbar>
      </AppBar>
      <DialogContent>
        <Tabs
          variant="scrollable"
          value={currentTab}
          onChange={(_, value) => setCurrentTab(value)}
        >
          {titles.map(title =>
          <Tab
            key={"userguide-tab-" + title}
            label={title}
          />
          )}
        </Tabs>
        <div className={classes.tabContents}>
          {currentTab === 0
          ? <img src={content[currentTab]} />
          : <Typography
              variant='body1'
              style={{ whiteSpace: "pre-line" }}
            >
              {content[currentTab]}
            </Typography>
          }
        </div>
      </DialogContent>
    </Dialog>
  )
}
