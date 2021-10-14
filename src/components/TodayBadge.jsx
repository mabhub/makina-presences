import React from 'react';

import { Box } from '@material-ui/core';
import { makeStyles, alpha } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  root: {
    zIndex: 2,
    position: 'absolute',
    overflow: 'hidden',
    width: 80,
    height: 80,
    fontSize: '0.5rem',
    pointerEvents: 'none',
  },

  stripe: {
    textAlign: 'center',
    backgroundColor: alpha(theme.palette.secondary.main, 0.7),
    color: theme.palette.secondary.contrastText,
    boxShadow: theme.shadows[2],
    whiteSpace: 'nowrap',
    width: 120,
    position: 'absolute',
    top: 0,
    left: 0,
    transform: 'translate(-50%, -50%) translate(18px, 18px) rotate(-45deg)',
  },
}));

const TodayBadge = () => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.stripe}>
        aujourd'hui
      </Box>
    </Box>
  );
};

export default TodayBadge;
