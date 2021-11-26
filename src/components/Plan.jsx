import React from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

import createPersistedState from 'use-persisted-state';

import { Box, Fab, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import withStyles from '@mui/styles/withStyles';
import usePlans from '../hooks/usePlans';
import useSpots from '../hooks/useSpots';
import usePresences from '../hooks/usePresences';
import SpotDescription from './SpotDescription';
import { sameLowC } from '../helpers';

const useTriState = createPersistedState('tri');

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
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },

  locked: {
    opacity: 0.3,
    boxShadow: 'none',
    cursor: 'not-allowed',

    borderColor: 'silver !important',
  },

  conflict: {
    backgroundColor: 'red !important',
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
  minScale: 0.25,
  panning: {
    velocityDisabled: true,
    excluded: ['MuiButtonBase-root'],
  },
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
        x: Math.round((e.clientX - rect.left) / 5) * 5,
        y: Math.round((e.clientY - rect.top) / 5) * 5,
      }),
    },
  );
};

const Children = ({ children }) => children;

const Plan = ({ edit }) => {
  const classes = useStyles();
  const queryClient = useQueryClient();

  const plans = usePlans();
  const { place, day = dayjs().format('YYYY-MM-DD') } = useParams();

  const spots = useSpots(place);
  const { plan: [plan] = [] } = plans.find(({ Name }) => Name === place) || {};

  const [tri] = useTriState('');

  const isPast = dayjs(day).hour(24).isBefore(dayjs().hour(0));

  const { presences, setPresence, deletePresence } = usePresences(place);
  const dayPresences = presences.filter(presence => presence.day === day);
  const spotPresences = dayPresences
    .reduce((acc, { spot, ...presence }) => ({
      ...acc,
      [spot]: [...(acc[spot] || []), presence],
    }), {});

  const DragWrapper = edit ? Children : TransformWrapper;
  const DragComponent = edit ? Children : TransformComponent;
  const [movingSpot, setMovingSpot] = React.useState();

  const snap = (v, a = 5) => Math.round(v / a) * a;

  const handleMouseDown = s => ({ screenX, screenY }) => {
    if (!edit) { return null; }
    return setMovingSpot({ spot: s, from: [screenX, screenY] });
  };

  const handleDragEnd = async ({ screenX: x2, screenY: y2 }) => {
    if (!movingSpot || !edit) { return; }

    const { spot, from: [x1, y1] = [] } = movingSpot;
    const deltas = { x: x2 - x1, y: y2 - y1 };

    setMovingSpot();

    const { VITE_BASEROW_TOKEN: token } = import.meta.env;

    await fetch(
      `https://api.baserow.io/api/database/rows/table/${32973}/${spot.id}/?user_field_names=true`,
      {
        method: 'PATCH',
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          x: snap(deltas.x + Number(spot.x)),
          y: snap(deltas.y + Number(spot.y)),
        }),
      },
    );

    queryClient.invalidateQueries([`${32973}`]);
  };

  return (
    <DragWrapper {...transformWrapperProps}>
      <DragComponent
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

          {spots.map(Spot => {
            const { Bloqué, Identifiant: spot, x, y, Type, Description } = Spot;
            const [presence, ...rest] = spotPresences[spot] || [];

            const isLocked = Boolean(Bloqué);
            const isConflict = Boolean(rest.length);
            const isOccupied = Boolean(presence);
            const isOwnSpot = Boolean(sameLowC(presence?.tri, tri));

            const canClick = Boolean(!isLocked && (!isOccupied || isOwnSpot));

            const tooltip = <SpotDescription md={Description} spot={Spot} />;

            return (
              <CustomTooltip
                key={spot}
                title={(!edit && !isPast) ? tooltip : ''}
                placement="right"
                enterDelay={500}
              >
                <Fab
                  className={clsx({
                    [classes.spot]: true,
                    [classes.conflict]: isConflict,
                    [classes.occupied]: isOccupied && !isOwnSpot,
                    [classes.ownSpot]: isOwnSpot,
                    [classes.locked]: isLocked,
                    [`hl-${presence?.tri}`]: presence?.tri,
                  })}
                  disabled={isPast}
                  component={canClick ? 'div' : 'button'}
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    borderColor: Type?.color?.replace('-', ''),
                  }}
                  size="small"
                  draggable={Boolean(edit)}
                  onMouseDown={edit && handleMouseDown(Spot)}
                  onDragEnd={edit && handleDragEnd}
                  onClick={() => {
                    if (edit) { return null; }

                    if (!isOccupied && !isLocked) {
                      const [firstId, ...extraneous] = dayPresences
                        ?.filter(({ tri: t }) => sameLowC(t, tri))
                        ?.map(({ id }) => id);

                      setPresence({ id: firstId, day, tri, spot, plan: place });
                      extraneous.forEach(i => deletePresence({ id: i }));
                    }

                    if (isOwnSpot) {
                      return deletePresence(presence);
                    }

                    return null;
                  }}
                >
                  {(!edit && presence?.tri) || spot}
                </Fab>
              </CustomTooltip>
            );
          })}
        </Box>
      </DragComponent>
    </DragWrapper>
  );
};

export default React.memo(Plan);
