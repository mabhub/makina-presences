import clsx from 'clsx';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';

import createPersistedState from 'use-persisted-state';

import { ErrorOutline } from '@mui/icons-material';
import { Divider, Fab, Grid, Tooltip } from '@mui/material';
import { alpha, lighten } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import withStyles from '@mui/styles/withStyles';
import { sameLowC } from '../helpers';
import usePresences from '../hooks/usePresences';
import useSpots from '../hooks/useSpots';
import ContextualMenu from './ContextualMenu';
import SpotButtonHalfDay from './SpotButtonHalfDay';
import SpotDescription from './SpotDescription';

const useTriState = createPersistedState('tri');

const { VITE_TABLE_ID_SPOTS: spotsTableId, VITE_ENABLE_HALFDAY: enableHalfDay } = import.meta.env;

export const FULLDAY_PERIOD = 'fullday';
export const MORNING_PERIOD = 'morning';
export const AFTERNOON_PERIOD = 'afternoon';

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
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    fontSize: '0.75em',
  },

  fullDayAvailable: {
    opacity: 0.3,

    '&:hover ': {
      background: alpha(theme.palette.primary.fg, 0.5),
    },
  },

  morningAvailable: {
    '&:hover *[class^="makeStyles-top"]': {
      background: alpha(theme.palette.primary.fg, 0.5),
      transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: 0.5,
    },
  },
  afternoonAvailable: {
    '&:hover *[class^="makeStyles-bottom"]': {
      background: alpha(theme.palette.primary.fg, 0.5),
      transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: 0.5,
    },
  },

  morning: {
    '&:hover *[class^="makeStyles-top"]': {
      backgroundColor: alpha(theme.palette.primary.main, 0.25),
      transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  afternoon: {
    cursor: 'pointer',
    '&:hover *[class^="makeStyles-bottom"]': {
      backgroundColor: alpha(theme.palette.primary.main, 0.25),
      transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  divider: {
    width: '100%',
    zIndex: 1,
  },

  locked: {
    opacity: 0.3,
    boxShadow: 'none',
    cursor: 'not-allowed',

    borderColor: 'silver !important',
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

  fullDay: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    opacity: 1,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.5),
    },
  },
  fullDayPending: {
    backgroundColor: theme.palette.secondary.main,
  },

  badge: {
    position: 'absolute',
    color: theme.palette.error.main,
    background: theme.palette.primary.bg,
    borderRadius: 99,
    zIndex: 1,
    transform: 'translate(10%, -100%)',
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
  const [ownTri] = useTriState('');
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

  const getPresence = () => {
    const spotIdPresences = spotPresences[spotId] || [];

    const morningPresences = spotIdPresences.filter(p => p.period === MORNING_PERIOD);
    const afternoonPresences = spotIdPresences.filter(p => p.period === AFTERNOON_PERIOD);
    const fullDayPresences = spotIdPresences.filter(p => !Object.hasOwn(p, 'period')
    || p.period === ''
    || p.period === FULLDAY_PERIOD);

    return [fullDayPresences, morningPresences, afternoonPresences];
  };

  const currentTriPeriod = () => {
    const spoIdtPresences = getPresence();
    if (spoIdtPresences[0].some(({ tri }) => tri === ownTri)) return FULLDAY_PERIOD;
    if (spoIdtPresences[1].some(({ tri }) => tri === ownTri)) return MORNING_PERIOD;
    if (spoIdtPresences[2].some(({ tri }) => tri === ownTri)) return AFTERNOON_PERIOD;
    return undefined;
  };

  const [fullDays, mornings, afternoons] = getPresence();

  const [presenceFullDay, ...restFullDay] = fullDays;
  const [presenceMorning, ...restMorning] = mornings;
  const [presenceAfternon, ...restAfternoon] = afternoons;

  const isLocked = Boolean(blocked);
  const isConflict = Boolean(restFullDay.length);
  const isOccupied = Boolean(presenceFullDay || (mornings.length === 1 && afternoons.length === 1));
  const isOwnSpot = Boolean(sameLowC(presenceFullDay?.tri, ownTri)
    || sameLowC(presenceMorning?.tri, ownTri)
    || sameLowC(presenceAfternon?.tri, ownTri));
  const isCumulative = Boolean(Cumul);

  const canClick = Boolean(!isLocked && (!isOccupied || isOwnSpot));

  const handleConflict = (value, tri) => {
    onConflict(value, tri, spotId);
  };

  useEffect(() => {
    if (isConflict && restFullDay.some(({ tri }) => sameLowC(ownTri, tri))) {
      handleConflict(isConflict,
        fullDays.find(({ tri: t }) => ownTri !== t).tri);
    }
  }, [isConflict]);

  const removePresence = period => {
    if (period === FULLDAY_PERIOD) deletePresence(presenceFullDay);
    if (period === MORNING_PERIOD) deletePresence(presenceMorning);
    if (period === AFTERNOON_PERIOD) deletePresence(presenceAfternon);
  };

  const [contextualMenu, setContextualMenu] = useState(false);
  const [anchor, setAnchor] = useState(null);

  const unsubscribe = () => {
    removePresence(currentTriPeriod());
  };

  const handleClick = p => {
    if (edit) { return null; }

    if ((!isOccupied && !isLocked) || (currentTriPeriod())) {
      const [firstId, ...extraneous] = dayPresences
        ?.filter(({ tri: t }) => sameLowC(t, ownTri)) // Keep only own points
        ?.filter(({ spot: s }) => !isCumulativeSpot(s)) // Keep only non cumulative
        ?.filter(() => !isCumulative)
        ?.map(({ id }) => id);

      setPresence({ id: firstId, day, tri: ownTri, spot: spotId, plan: place, period: p });
      extraneous.forEach(i => deletePresence({ id: i }));
    }

    const [previousPeriod] = dayPresences
      .filter(({ spot: s }) => !isCumulativeSpot(s))
      .filter(({ tri: t }) => sameLowC(t, ownTri))
      .map(({ period }) => period);
    if (isOwnSpot && previousPeriod === p) {
      return unsubscribe();
    }

    return null;
  };

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
    { item: 'Journée entière',
      action: fullDay,
      disabled: mornings.filter(({ tri: t }) => !sameLowC(t, ownTri)).length > 0
        || afternoons.filter(({ tri: t }) => !sameLowC(t, ownTri)).length > 0
        || fullDays.filter(({ tri: t }) => sameLowC(t, ownTri)).length === 1 },
    { item: 'Matinée uniquement', action: morningOnly, disabled: mornings.length > 0 },
    { item: 'Après-midi uniquement', action: afternoonOnly, disabled: afternoons.length > 0 },
    { item: 'separator', separator: true },
    { item: 'Se désinscrire', action: unsubscribe, disabled: Boolean(!currentTriPeriod()) },
  ];

  const title = 'Réserver pour :';

  const tooltip = <SpotDescription md={Description} spot={spot} />;

  return (
    <>
      {(isConflict || Boolean(restAfternoon.length) || Boolean(restMorning.length)) && (
        <Tooltip
          title="Attention, plusieurs personnes sont inscris sur ce poste."
          placement="right"
        >
          <ErrorOutline
            className={classes.badge}
            style={{
              left: `${x}px`,
              top: `${y}px`,
            }}
          />
        </Tooltip>
      )}
      <CustomTooltip
        key={spotId}
        title={(!edit && !isPast) ? tooltip : ''}
        placement="right"
        enterDelay={500}
      >
        <Fab
          className={clsx({
            [classes.spot]: true,
            [classes.fullDayAvailable]: mornings.length === 0 && afternoons.length === 0,
            [classes.occupied]: isOccupied && !isOwnSpot,
            [classes.fullDay]: currentTriPeriod() === FULLDAY_PERIOD,
            [classes.fullDayPending]: currentTriPeriod() === FULLDAY_PERIOD
              && presenceFullDay?.fake,
            [classes.morning]: currentTriPeriod() === MORNING_PERIOD,
            [classes.afternoon]: currentTriPeriod() === AFTERNOON_PERIOD,
            [classes.locked]: isLocked,
            [`hl-${presenceFullDay?.tri}`]: presenceFullDay?.tri,
            [classes.morningAvailable]: mornings.length === 0
              && currentTriPeriod() !== AFTERNOON_PERIOD,
            [classes.afternoonAvailable]: afternoons.length === 0
              && currentTriPeriod() !== MORNING_PERIOD,
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
          onClick={event => {
            if (isCumulative && currentTriPeriod()) return unsubscribe();
            if (mornings.length === 1 && mornings[0].tri !== ownTri) {
              return afternoonOnly();
            }
            if ((afternoons.length === 1 && afternoons[0].tri !== ownTri) || event.ctrlKey) {
              return morningOnly();
            }
            if (sameLowC(afternoons[0]?.tri, ownTri) || sameLowC(mornings[0]?.tri, ownTri)) {
              return handleClick(currentTriPeriod());
            }
            return fullDay();
          }}
          onContextMenu={event => {
            if (enableHalfDay === 'false') return null;
            event.preventDefault();

            if (event.ctrlKey) return afternoonOnly();

            setContextualMenu(true);
            setAnchor(event.target);
            return null;
          }}
        >
          {afternoons.length === 0 && mornings.length === 0
            ? ((!edit && !isConflict && presenceFullDay?.tri)
              || (isConflict && (fullDays
                .some(({ tri }) => sameLowC(ownTri, tri))
                ? fullDays.find(({ tri }) => sameLowC(ownTri, tri)).tri
                : presenceFullDay.tri)
              )
              || spotId)
            : (
              <Grid container>
                {['top', 'bottom'].map((position, i) => (
                  <React.Fragment key={position}>
                    <SpotButtonHalfDay
                      presences={position === 'top' ? mornings : afternoons}
                      onConflict={handleConflict}
                      disabled={isPast}
                      position={position}
                    />
                    {i === 0 && (
                      <Divider
                        className={classes.divider}
                        sx={{
                          borderColor: Type?.color?.replace('-', ''),
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </Grid>
            )}

        </Fab>
      </CustomTooltip>
      {contextualMenu && (
        <ContextualMenu
          anchor={anchor}
          title={title}
          items={contextualMenuItems}
          onClose={setContextualMenu}
        />
      )}
    </>
  );
};

export default React.memo(SpotButton);
