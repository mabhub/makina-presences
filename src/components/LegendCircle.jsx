import React from 'react';

import { Box, Grid } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

const useItemStyles = makeStyles(theme => {
  const maxWidth = mq => `@media (max-width: ${theme.breakpoints.values[mq]}px)`;

  return {
    spot: {
      border: '2px solid transparent',
      borderRadius: '50%',
      width: 30,
      height: 30,
      [maxWidth('md')]: {
        width: 20,
        height: 20,
      },
      opacity: 0.5,

    },

    type: {
      display: 'flex',
      alignItems: 'center',
      [maxWidth('md')]: {
        fontSize: '0.8em',
      },
    },
  };
});

const Circle = ({
  bgColor = 'transparent',
  color = 'silver',
  label,
}) => {
  const classes = useItemStyles();

  const circleStyle = {};

  if (color) {
    circleStyle.borderColor = color.replace('-', '');
  }

  if (bgColor) {
    circleStyle.backgroundColor = bgColor;
  }

  return (
    <Grid
      container
      className={classes.type}
      alignItems="center"
      spacing={1}
    >
      <Grid item>
        <Box
          className={classes.spot}
          style={circleStyle}
        />
      </Grid>
      <Grid item>
        {label}
      </Grid>
    </Grid>
  );
};

export default React.memo(Circle);
