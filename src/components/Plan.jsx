import React from 'react';
import clsx from 'clsx';

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

import createPersistedState from 'use-persisted-state';

import { Box, Fab } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import usePlans from '../hooks/usePlans';
import useSpots from '../hooks/useSpots';

const usePlaceState = createPersistedState('place');

const useStyles = makeStyles(() => ({
  wrapper: {
    width: '100%',
    height: '100%',
  },

  content: {
  },

  plan: {},

  spot: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    border: '2px solid transparent',
  },

  locked: {
    opacity: 0.2,
    cursor: 'not-allowed',
  },
}));

const transformWrapperProps = {
  panning: { velocityDisabled: true },
  doubleClick: { disabled: true },
  zoomAnimation: { disabled: true },
  alignmentAnimation: { disabled: true },
  velocityAnimation: { disabled: true },
};

const Plan = () => {
  const classes = useStyles();

  const plans = usePlans();
  const [place] = usePlaceState('');
  const spots = useSpots(place);
  const { plan: [plan] = [] } = plans.find(({ Name }) => Name === place) || {};

  return (
    <TransformWrapper {...transformWrapperProps}>
      <TransformComponent
        wrapperClass={classes.wrapper}
        contentClass={classes.content}
      >
        <Box style={{ position: 'relative' }}>
          {plan?.url && (
            <img src={plan.url} alt="" className={classes.plan} />
          )}

          {spots.map(spot => (
            <Fab
              key={spot.Identifiant}
              className={clsx({
                [classes.spot]: true,
                [classes.locked]: spot?.Bloqué,
              })}
              style={{
                left: `${spot.x}px`,
                top: `${spot.y}px`,
                borderColor: spot?.Type?.color?.replace('-', ''),
              }}
              size="small"
            >
              {spot.Identifiant}
            </Fab>
          ))}
        </Box>
      </TransformComponent>
    </TransformWrapper>
  );
};

export default Plan;
