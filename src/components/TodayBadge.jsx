import React from 'react';

import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';

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
    transform: 'translate(-50%, -50%) translate(21px, 15px) rotate(-30deg)',
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
