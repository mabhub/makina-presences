import React from 'react';

import createPersistedState from 'use-persisted-state';

import { Box, Fab } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import usePlans from '../hooks/usePlans';
import useSpots from '../hooks/useSpots';

const usePlaceState = createPersistedState('place');

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
    position: 'relative',
  },

  plan: {},
}));

const Plan = () => {
  const classes = useStyles();

  const plans = usePlans();
  const [place] = usePlaceState('');
  const spots = useSpots(place);
  const { plan: [plan] = [] } = plans.find(({ Name }) => Name === place) || {};

  return (
    <Box className={classes.root}>
      {plan?.url && (
        <img src={plan.url} alt="" className={classes.plan} />
      )}

      {spots.map(spot => (
        <Fab
          key={spot.Identifiant}
          color="primary"
          style={{ position: 'absolute', left: `${spot.x}px`, top: `${spot.y}px` }}
        >
          {spot.Identifiant}
        </Fab>
      ))}
    </Box>
  );
};

export default Plan;
