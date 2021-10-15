import React from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

import createPersistedState from 'use-persisted-state';

import { Box, Fab, Tooltip, Typography } from '@material-ui/core';
import { makeStyles, withStyles, alpha } from '@material-ui/core/styles';
import usePlans from '../hooks/usePlans';
import useSpots from '../hooks/useSpots';
import usePresences from '../hooks/usePresences';

const useTriState = createPersistedState('tri');
const useDayState = createPersistedState('day');
const usePlaceState = createPersistedState('place');

const CustomTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.getContrastText(theme.palette.background.default),
    boxShadow: theme.shadows[2],
  },
}))(Tooltip);

const useStyles = makeStyles(theme => ({
  wrapper: {
    width: '100%',
    height: '100%',
  },

  content: {
  },

  planWrapper: {
    position: 'relative',
  },
  plan: {},

  spot: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    border: '2px solid transparent',
    backgroundColor: 'white',
    color: theme.palette.grey[600],
    textTransform: 'none',
    opacity: 0.3,
  },

  locked: {
    opacity: 0.2,
    boxShadow: 'none',
    cursor: 'not-allowed',
  },

  conflict: {
    backgroundColor: 'red',
  },

  occupied: {
    backgroundColor: alpha(theme.palette.primary.main, 0.25),
    color: theme.palette.primary.main,
    opacity: 1,
    cursor: 'default',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.25),
    },
  },

  ownSpot: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    opacity: 1,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.5),
    },
  },
}));

const transformWrapperProps = {
  panning: { velocityDisabled: true },
  doubleClick: { disabled: true },
  zoomAnimation: { disabled: true },
  alignmentAnimation: { disabled: true },
  velocityAnimation: { disabled: true },
};

export const createSpot = async e => {
  const { VITE_BASEROW_TOKEN: token } = import.meta.env;
  const rect = e.target.getBoundingClientRect();
  await fetch(
    `https://api.baserow.io/api/database/rows/table/${32973}/?user_field_names=true`,
    {
      method: 'POST',
      headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Identifiant: 'PX',
        x: Math.floor((e.clientX - rect.left) / 5) * 5,
        y: Math.floor((e.clientY - rect.top) / 5) * 5,
      }),
    },
  );
};

const Plan = () => {
  const classes = useStyles();

  const plans = usePlans();
  const [place] = usePlaceState('');
  const spots = useSpots(place);
  const { plan: [plan] = [] } = plans.find(({ Name }) => Name === place) || {};

  const [tri] = useTriState('');

  const today = dayjs(dayjs().format('YYYY-MM-DD')); // Wacky trick to strip time
  const [day] = useDayState(today);

  const isPast = dayjs(day).hour(24).isBefore(dayjs().hour(0));

  const { presences, createPresence, deletePresence } = usePresences(place);
  const dayPresences = presences.filter(presence => presence.day === day);
  const spotPresences = dayPresences
    .reduce((acc, { spot, ...presence }) => ({
      ...acc,
      [spot]: [...(acc[spot] || []), presence],
    }), {});

  return (
    <TransformWrapper {...transformWrapperProps}>
      <TransformComponent
        wrapperClass={classes.wrapper}
        contentClass={classes.content}
      >
        <Box
          className={classes.planWrapper}
          // onClick={createSpot}
        >
          {plan?.url && (
            <img src={plan.url} alt="" className={classes.plan} />
          )}

          {spots.map(({ Bloqué, Identifiant: spot, x, y, Type, Description }) => {
            const [presence, ...rest] = spotPresences[spot] || [];

            const isLocked = Boolean(Bloqué);
            const isConflict = Boolean(rest.length);
            const isOccupied = Boolean(presence);
            const isOwnSpot = Boolean(presence?.tri === tri);

            const canClick = Boolean(!isLocked && (!isOccupied || isOwnSpot));

            const tooltip = !Description ? '' : (
              <>
                {Description && (
                  <Typography variant="body1" component="pre">
                    {Description}
                  </Typography>
                )}
              </>
            );

            return (
              <CustomTooltip key={spot} title={tooltip} placement="right">
                <Fab
                  className={clsx({
                    [classes.spot]: true,
                    [classes.locked]: isLocked,
                    [classes.conflict]: isConflict,
                    [classes.occupied]: isOccupied && !isOwnSpot,
                    [classes.ownSpot]: isOwnSpot,
                  })}
                  disabled={isPast}
                  component={canClick ? 'div' : 'button'}
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    borderColor: Type?.color?.replace('-', ''),
                  }}
                  size="small"
                  onClick={() => {
                    if (!isOccupied && !isLocked) {
                      dayPresences
                        .filter(({ tri: t }) => t === tri)
                        .map(p => deletePresence(p));
                      return createPresence(day, tri, { spot, plan: place });
                    }

                    if (isOwnSpot) {
                      return deletePresence(presence);
                    }

                    return null;
                  }}
                >
                  {presence?.tri || spot}
                </Fab>
              </CustomTooltip>
            );
          })}
        </Box>
      </TransformComponent>
    </TransformWrapper>
  );
};

export default Plan;
