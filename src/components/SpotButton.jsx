import clsx from 'clsx';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';

import createPersistedState from 'use-persisted-state';

import { Divider, Fab, Grid, Tooltip } from '@mui/material';
import { alpha, lighten } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import withStyles from '@mui/styles/withStyles';
import { sameLowC } from '../helpers';
import usePresences from '../hooks/usePresences';
import useSpots from '../hooks/useSpots';
import SpotDescription from './SpotDescription';
import ContextualMenu from './ContextualMenu';

const useTriState = createPersistedState('tri');

const { VITE_TABLE_ID_SPOTS: spotsTableId } = import.meta.env;

const FULLDAY_PERIOD = 'fullday';
const MORNING_PERIOD = 'morning';
const AFTERNOON_PERIOD = 'afternoon';

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
    '&.MuiButtonBase-root:hover': {
      backgroundColor: 'transparent',
    },
  },

  visible: {
    opacity: 1,
  },

  fullSpot: {
    width: 35,
    height: 35,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  top: {
    position: 'absolute',
    top: 0,
    height: 15,
    width: '100%',
    textAlign: 'center',
    lineHeight: 'normal',
    all: 'unset',
  },

  divider: {
    width: '100%',
  },

  bottom: {
    position: 'absolute',
    bottom: 0,
    height: 15,
    width: '100%',
    textAlign: 'center',
    lineHeight: 'normal',
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

  empty: {
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.fg, 0.25),
    },
  },

  occupied: {
    backgroundColor: alpha(theme.palette.primary.main, 0.25),
    color: lighten(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.75 : 0),
    cursor: 'default',
    boxShadow: 'none',
    // '&:hover': {
    //   backgroundColor: alpha(theme.palette.primary.main, 0.25),
    // },
  },

  ownSpot: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
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
  Spot,
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
    .reduce((acc, { spot, ...presence }) => ({
      ...acc,
      [spot]: [...(acc[spot] || []), presence],
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

    const { spot, from: [x1, y1] = [] } = movingSpot;
    const deltas = { x: x2 - x1, y: y2 - y1 };

    setMovingSpot();

    const { VITE_BASEROW_TOKEN: token } = import.meta.env;

    await fetch(
      `https://api.baserow.io/api/database/rows/table/${spotsTableId}/${spot.id}/?user_field_names=true`,
      {
        method: 'PATCH',
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          x: snap(deltas.x + Number(spot.x)),
          y: snap(deltas.y + Number(spot.y)),
        }),
      },
    );

    queryClient.invalidateQueries([`${spotsTableId}`]);
  };

  const isPast = dayjs(day).hour(24).isBefore(dayjs().hour(0));

  const { Bloqué, Identifiant: spotId, x, y, Type, Description, Cumul } = Spot;

  const [presence, ...rest] = spotPresences[spotId] || [];

  let reservationPeriod = FULLDAY_PERIOD;
  if (presence) {
    reservationPeriod = presence.period;
  }

  const getPresence = () => {
    const [presence] = spotPresences[spotId] || [];

    let morningPresence;
    let afternoonPresence;
    if (presence && presence.period !== FULLDAY_PERIOD) {
      morningPresence = (spotPresences[spotId] || [])
        .find(p => p.period === MORNING_PERIOD);
      afternoonPresence = (spotPresences[spotId] || [])
        .find(p => p.period === AFTERNOON_PERIOD);

      return [morningPresence, afternoonPresence];
    }

    return [presence];
  };

  // TODO
  // const isConflict = () => {
  //   const presence = getPresence();
  //   if(presence.length == 1) {
  //     const [_, ...rest] = spotPresences[spotId] || [];
  //     return rest.length && rest.some(({ period }) => period === presence[0].period);
  //   }
  //   return (spotPresences[spotId] || [])
  //     .some(({ period, t }) => period === (presence[0].period || presence[1].period) && t !==tri)
  // }

  const isLocked = Boolean(Bloqué);
  const isConflict = Boolean(rest.length
    && rest.some(({ period }) => period === reservationPeriod));
  const isOccupied = Boolean(presence);
  const isOwnSpot = Boolean(sameLowC(presence?.tri, tri));
  const isCumulative = Boolean(Cumul);

  const isMorning = reservationPeriod === MORNING_PERIOD;
  const isAfternoon = reservationPeriod === AFTERNOON_PERIOD;
  const isFullDay = !isMorning && !isAfternoon;

  useEffect(() => {
    if (isConflict) {
      onConflict(isConflict,
        spotPresences[spotId].find(({ tri: t }) => tri !== t).tri,
        spotId);
      deletePresence({ id: dayPresences.find(({ tri: t }) => t === tri).id });
    }
  }, [isConflict]);

  const canClick = Boolean(!isLocked && (!isOccupied || isOwnSpot));

  const tooltip = <SpotDescription md={Description} spot={Spot} />;

  const handleClick = p => {
    if (edit) { return null; }

    if (!isOccupied && !isLocked) {
      const [firstId, ...extraneous] = dayPresences
        ?.filter(({ tri: t }) => sameLowC(t, tri)) // Keep only own points
        ?.filter(({ spot: s }) => !isCumulativeSpot(s)) // Keep only non cumulative
        ?.filter(() => !isCumulative)
        ?.map(({ id }) => id);

      setPresence({ id: firstId, day, tri, spot: spotId, plan: place, period: p });
      extraneous.forEach(i => deletePresence({ id: i }));
    }

    if (isOwnSpot) {
      return deletePresence(presence);
    }

    return null;
  };

  const [contextualMenu, setContextualMenu] = useState(false);
  const [anchor, setAnchor] = useState(null);

  const fullDay = () => {
    handleClick(FULLDAY_PERIOD);
  };
  const morningOnly = () => {
    handleClick(MORNING_PERIOD);
  };
  const afternoonOnly = () => {
    handleClick(AFTERNOON_PERIOD);
  };

  const contextualMenuItems = [
    { item: 'Journée entière', action: fullDay },
    { item: 'Matinée uniquement', action: morningOnly },
    { item: 'Après-midi uniquement', action: afternoonOnly },
  ];

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
          onMouseDown={edit && handleMouseDown(Spot)}
          onDragEnd={edit && handleDragEnd}
          onClick={fullDay}
          onContextMenu={event => {
            event.preventDefault();
            setContextualMenu(true);
            console.log(event.target);
            setAnchor(event.target);
          }}
        >
          {/* <Grid container>
            <Grid
              item
              className={clsx({
                [classes.top]: isMorning,
                [classes.fullSpot]: isFullDay,
              })}
            >
              {(isMorning || isFullDay) && ((!edit && presence?.tri) || spotId)}
            </Grid>
            {!isFullDay && (<Divider className={classes.divider} />)}
            <Grid
              item
              className={clsx({
                [classes.bottom]: isAfternoon,
              })}
            >
              {isAfternoon && ((!edit && presence?.tri) || spotId)}
            </Grid>
          </Grid> */}
          {((!edit && presence?.tri) || spotId)}
        </Fab>
      </CustomTooltip>
      {contextualMenu && (<ContextualMenu anchor={anchor} title="Réserver pour :" items={contextualMenuItems} />)}
    </>
  );
};

export default React.memo(SpotButton);
