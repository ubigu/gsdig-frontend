import React from 'react';
import { makeStyles, Tooltip, Fab } from '@material-ui/core';
import { MergeType, CallSplit } from '@material-ui/icons';
// import MergeFeaturesDialog from './MergeFeaturesDialog'
import { useTranslations } from '@src/translation/TranslationContext';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    '&> *': {
      marginRight: theme.spacing(1),
    }
  }
}));

interface Props {
  selectedFeatures: (string | number)[],
  onMergeClick: Function,
  onUnmergeClick: Function,
}

export default function MergeFeaturesControl({
  selectedFeatures,
  onMergeClick,
  onUnmergeClick,
}: Props) {

  const classes = useStyles();
  const { tr } = useTranslations();

  return (
    <div className={classes.container}>
      <Tooltip
        arrow
        title={tr.FeatureTable.merge}
      >
        <span>
          <Fab
            color="primary"
            disabled={selectedFeatures.length < 2}
            onClick={() => onMergeClick()}
          >
            <MergeType />
          </Fab>
        </span>
      </Tooltip>
      <Tooltip
        arrow
        title={tr.FeatureTable.unmerge}
      >
        <span>
          <Fab
            color="primary"
            disabled={selectedFeatures.length != 1}
            onClick={() => onUnmergeClick()}
          >
            <CallSplit />
          </Fab>
        </span>
      </Tooltip>
    </div>
  )
}