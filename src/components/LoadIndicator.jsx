import React from 'react';
import clsx from 'clsx';
import { useIsFetching, useIsMutating } from 'react-query';

import { LinearProgress } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(theme => ({
  progress: {
    top: 0,
    left: 0,
    height: 0,
    width: '100%',
    zIndex: 99999,
    filter: theme.palette.mode === 'dark' ? 'contrast(250%)' : '',
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
      sx={{
        position: 'fixed',
        opacity: theme => (theme.palette.mode === 'dark' ? 1 : 0.5),
      }}
      {...props}
    />
  );
};

export default LoadIndicator;
