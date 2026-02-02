import clsx from 'clsx';
import dayjs from 'dayjs';
import React from 'react';

import { Fab } from '@mui/material';
import { alpha, lighten } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import { baseFlags, isEnable } from '../feature_flag_service';
import { sameLowC } from '../helpers';
import { FULLDAY_PERIOD, MORNING_PERIOD, AFTERNOON_PERIOD } from '../hooks/constants/periods';
import useSpotPresenceLogic from '../hooks/useSpotPresenceLogic';
import useSpotInteractions from '../hooks/useSpotInteractions';
import ContextualMenu from './ContextualMenu';
import SpotDescription from './SpotDescription';
import SpotButtonBadges from './SpotButton/SpotButtonBadges';
import SpotButtonContent from './SpotButton/SpotButtonContent';
import CustomTooltip from './SpotButton/CustomTooltip';

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
      <SpotButtonBadges
        isConflict={isConflict}
        mornings={mornings}
        afternoons={afternoons}
        x={x}
        y={y}
      />
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

            openContextualMenu(event);
            return null;
          }}
        >
          <SpotButtonContent
            mornings={mornings}
            afternoons={afternoons}
            fullDays={fullDays}
            presenceFullDay={presenceFullDay}
            isConflict={isConflict}
            edit={edit}
            ownTri={ownTri}
            spotId={spotId}
            handleConflict={handleConflict}
            isPast={isPast}
            isHover={isHover}
            triPeriod={triPeriod}
            borderColor={Type?.color?.replace('-', '')}
          />
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
