import React from 'react';
import clsx from 'clsx';
import { useIsFetching, useIsMutating } from 'react-query';

import { LinearProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  progress: {
    position: 'fixed',
    opacity: 0.5,
    top: 0,
    left: 0,
    height: 0,
    width: '100%',
    transition: 'height ease 150ms',
    '& .MuiLinearProgress-bar': {
      animationPlayState: 'paused',
    },
  },
  progressVisible: {
    height: 4,
    '& .MuiLinearProgress-bar': {
      animationPlayState: 'running',
    },
  },
}));

const LoadIndicator = props => {
  const classes = useStyles();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  return (
    <LinearProgress
      className={clsx(
        classes.progress,
        { [classes.progressVisible]: Boolean(isFetching || isMutating) },
      )}
      color="secondary"
      {...props}
    />
  );
};

export default LoadIndicator;
