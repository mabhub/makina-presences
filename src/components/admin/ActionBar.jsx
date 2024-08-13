import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { Box } from '@mui/material';

const useStyles = makeStyles(theme => {
  const maxWidth = mq => `@media (max-width: ${theme.breakpoints.values[mq]}px)`;

  return {
    root: {
      width: '100%',
      background: 'red',
    },
  };
});

function ActionBar () {
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      test
    </Box>
  );
}

export default React.memo(ActionBar);
