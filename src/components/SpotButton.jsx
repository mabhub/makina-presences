import clsx from 'clsx';
import dayjs from 'dayjs';
import React from 'react';

import { ErrorOutline } from '@mui/icons-material';
import { Divider, Fab, Grid, Tooltip } from '@mui/material';
import { alpha, lighten } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import withStyles from '@mui/styles/withStyles';
import { baseFlags, isEnable } from '../feature_flag_service';
import { sameLowC } from '../helpers';
import { FULLDAY_PERIOD, MORNING_PERIOD, AFTERNOON_PERIOD } from '../constants/periods';
import useSpotPresenceLogic from '../hooks/useSpotPresenceLogic';
import useSpotInteractions from '../hooks/useSpotInteractions';
import ContextualMenu from './ContextualMenu';
import SpotButtonHalfDay from './SpotButtonHalfDay';
import SpotDescription from './SpotDescription';

const { FF_HALFDAY } = baseFlags;

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
    '&:hover': {
      backgroundColor: theme.palette.secondary.main,
    },
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

  const enableHalfDay = isEnable(FF_HALFDAY);

  // Use presence logic hook
  const {
    fullDays,
    mornings,
    afternoons,
    presenceFullDay,
    triPeriod,
    isLocked,
    isConflict,
    isOccupied,
    isOwnSpot,
    isCumulative,
    canClick,
    handleClick,
    handleConflict,
    unsubscribe,
    contextualMenuItems,
    ownTri,
    day,
  } = useSpotPresenceLogic(spot, onConflict);

  // Use interactions hook
  const {
    handleMouseDown,
    handleDragEnd,
    handleMouseEnter,
    handleMouseLeave,
    isHover,
    contextualMenu,
    anchor,
    openContextualMenu,
    closeContextualMenu,
  } = useSpotInteractions(spot, edit);

  const { Identifiant: spotId, x, y, Type, Description } = spot;
  const isPast = dayjs(day).hour(24).isBefore(dayjs().hour(0));

  // Presence actions
  const fullDay = () => {
    handleClick(FULLDAY_PERIOD);
  };
  const morningOnly = () => {
    handleClick(MORNING_PERIOD);
  };
  const afternoonOnly = () => {
    handleClick(AFTERNOON_PERIOD);
  };

  // UI
  const title = 'Réserver pour :';
  const tooltip = <SpotDescription md={Description} spot={spot} />;

  return (
    <>
      {(isConflict || Boolean(afternoons.length > 1) || Boolean(mornings.length > 1)) && (
        <Tooltip
          title="Plusieurs personnes sont inscrites sur ce poste"
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
            [classes.fullDay]: triPeriod === FULLDAY_PERIOD,
            [classes.fullDayPending]: triPeriod === FULLDAY_PERIOD
              && presenceFullDay?.fake,
            [classes.locked]: isLocked,
            [`hl-${presenceFullDay?.tri}`]: presenceFullDay?.tri,
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
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={event => {
            if (isCumulative && triPeriod) return unsubscribe();
            if (mornings.length === 1 && mornings[0].tri !== ownTri) {
              return afternoonOnly();
            }
            if ((afternoons.length === 1 && afternoons[0].tri !== ownTri) || event.ctrlKey) {
              return morningOnly();
            }
            if (afternoons.some(({ tri }) => sameLowC(tri, ownTri))
              || mornings.some(({ tri }) => sameLowC(tri, ownTri))) {
              return handleClick(triPeriod);
            }
            return fullDay();
          }}
          onContextMenu={event => {
            if (!enableHalfDay) return null;
            event.preventDefault();

            if (event.ctrlKey) return afternoonOnly();

            openContextualMenu(event.target);
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
                {['left', 'right'].map((position, index) => (
                  <React.Fragment key={position}>
                    <SpotButtonHalfDay
                      presences={position === 'left' ? mornings : afternoons}
                      onConflict={handleConflict}
                      disabled={isPast}
                      position={position}
                      isShared={Boolean(mornings.length) && Boolean(afternoons.length)}
                      isHover={isHover}
                      suggestOtherHalf={
                        position === 'left'
                          ? mornings.length === 0 && triPeriod !== AFTERNOON_PERIOD
                          : afternoons.length === 0 && triPeriod !== MORNING_PERIOD
                      }
                      borderColor={Type?.color?.replace('-', '')}
                    />
                    {index === 0 && (
                      <Divider
                        sx={{
                          width: '105%',
                          zIndex: 1,
                          borderColor: Type?.color?.replace('-', ''),
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%) rotate(90deg)',
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
          onClose={closeContextualMenu}
        />
      )}
    </>
  );
};

export default React.memo(SpotButton);
