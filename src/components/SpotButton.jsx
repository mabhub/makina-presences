import clsx from 'clsx';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';

import createPersistedState from 'use-persisted-state';

import { Fab, Tooltip } from '@mui/material';
import { alpha, lighten } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import withStyles from '@mui/styles/withStyles';
import { sameLowC } from '../helpers';
import usePresences from '../hooks/usePresences';
import useSpots from '../hooks/useSpots';
import SpotDescription from './SpotDescription';

const useTriState = createPersistedState('tri');

const { VITE_TABLE_ID_SPOTS: spotsTableId } = import.meta.env;

const useStyles = makeStyles(theme => ({
  spot: {
    width: 35,
    minWidth: 35,
    height: 35,
    minHeight: 35,
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    border: '2px solid transparent',
    backgroundColor: theme.palette.primary.bg,
    color: theme.palette.primary.fg,
    textTransform: 'none',
    opacity: 0.3,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    fontSize: '0.75em',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.fg, 0.25),
    },
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
    color: lighten(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.75 : 0),
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

const CustomTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.getContrastText(theme.palette.background.default),
    boxShadow: theme.shadows[2],
  },
}))(Tooltip);

const SpotButton = ({
  edit,
  spot,
  onConflict = () => {},
}) => {
  const classes = useStyles();
  const [tri] = useTriState('');
  const { place, day = dayjs().format('YYYY-MM-DD') } = useParams();

  const spots = useSpots(place);
  const cumulativeSpots = spots.filter(({ Cumul }) => Cumul);
  const isCumulativeSpot = React.useCallback(
    identifiant => cumulativeSpots.map(({ Identifiant }) => Identifiant).includes(identifiant),
    [cumulativeSpots],
  );

  const { presences, setPresence, deletePresence } = usePresences(place);
  const dayPresences = presences.filter(presence => presence.day === day);
  const spotPresences = dayPresences
    .reduce((acc, { spot: s, ...presence }) => ({
      ...acc,
      [s]: [...(acc[s] || []), presence],
    }), {});

  const queryClient = useQueryClient();
  const [movingSpot, setMovingSpot] = React.useState();
  const snap = (v, a = 5) => Math.round(v / a) * a;
  const handleMouseDown = s => ({ screenX, screenY }) => {
    if (!edit) { return null; }
    return setMovingSpot({ spot: s, from: [screenX, screenY] });
  };
  const handleDragEnd = async ({ screenX: x2, screenY: y2 }) => {
    if (!movingSpot || !edit) { return; }

    const { s, from: [x1, y1] = [] } = movingSpot;
    const deltas = { x: x2 - x1, y: y2 - y1 };

    setMovingSpot();

    const { VITE_BASEROW_TOKEN: token } = import.meta.env;

    await fetch(
      `https://api.baserow.io/api/database/rows/table/${spotsTableId}/${spot.id}/?user_field_names=true`,
      {
        method: 'PATCH',
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          x: snap(deltas.x + Number(s.x)),
          y: snap(deltas.y + Number(s.y)),
        }),
      },
    );

    queryClient.invalidateQueries([`${spotsTableId}`]);
  };

  const isPast = dayjs(day).hour(24).isBefore(dayjs().hour(0));

  const { Bloqué: blocked, Identifiant: spotId, x, y, Type, Description, Cumul } = spot;

  const [presence, ...rest] = spotPresences[spotId] || [];

  const isLocked = Boolean(blocked);
  const isConflict = Boolean(rest.length);
  const isOccupied = Boolean(presence);
  const isOwnSpot = Boolean(sameLowC(presence?.tri, tri));
  const isCumulative = Boolean(Cumul);

  useEffect(() => {
    // console.log(spotId, 'Changement', isConflict);
    if (isConflict) {
      onConflict(isConflict,
        spotPresences[spotId].find(({ tri: t }) => tri !== t).tri,
        spotId);
      deletePresence({ id: dayPresences.find(({ tri: t }) => t === tri).id });
    }
  }, [isConflict]);

  const canClick = Boolean(!isLocked && (!isOccupied || isOwnSpot));

  const tooltip = <SpotDescription md={Description} spot={spot} />;

  return (
    <>
      <CustomTooltip
        key={spotId}
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
          onMouseDown={edit && handleMouseDown(spot)}
          onDragEnd={edit && handleDragEnd}
          onClick={() => {
            if (edit) { return null; }

            if (!isOccupied && !isLocked) {
              const [firstId, ...extraneous] = dayPresences
                ?.filter(({ tri: t }) => sameLowC(t, tri)) // Keep only own points
                ?.filter(({ spot: s }) => !isCumulativeSpot(s)) // Keep only non cumulative
                ?.filter(() => !isCumulative)
                ?.map(({ id }) => id);

              setPresence({ id: firstId, day, tri, spot: spotId, plan: place });
              extraneous.forEach(i => deletePresence({ id: i }));
            }

            if (isOwnSpot) {
              return deletePresence(presence);
            }

            return null;
          }}
        >
          {(!edit && presence?.tri) || spotId}
        </Fab>
      </CustomTooltip>
    </>
  );
};

export default React.memo(SpotButton);
