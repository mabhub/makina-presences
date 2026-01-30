import clsx from 'clsx';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

import { AddCircleOutline, ErrorOutline, RemoveCircleOutline, Warning } from '@mui/icons-material';
import { Box, CardHeader, IconButton, Tooltip } from '@mui/material';
import { emphasize } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';

import { useParams } from 'react-router-dom';
import { sameLowC } from '../helpers';
import usePlan from '../hooks/usePlan';
import usePresences from '../hooks/usePresences';
import { Days, Months } from '../settings';
import SpotDialog from './SpotDialog';
import { baseFlags, isEnable } from '../feature_flag_service';

const useStyles = makeStyles(theme => ({
  cardHeader: {
    padding: theme.spacing(1, 1.5, 1, 2),
    background: theme.palette.secondary.bg,
  },
  conflict: {
    padding: theme.spacing(1, 1.5, 1, 1),
  },

  dayName: {
    textTransform: 'capitalize',
    color: 'black',
    filter: theme.palette.mode === 'dark' ? 'invert(100%)' : 'invert(0%)',
  },

  highlight: {
    backgroundColor: emphasize(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0 : 0.25),
  },

  personsPresent: {
    marginLeft: 8,
    fontSize: '10px',
    color: theme.palette.primary.main,
  },

  badge: {
    position: 'relative',
    bottom: '-3px',
    marginRight: theme.spacing(0.7),
    background: theme.palette.primary.bg,
    borderRadius: 99,
    zIndex: 1,
    width: 18,
    height: 18,
    color: theme.palette.error.main,
  },

  svg: {
    opacity: theme.palette.mode === 'light' ? '0.54' : '1',
    filter: theme.palette.mode === 'light' ? 'invert(0)' : 'invert(1)',
  },
  parkingButton: {
    position: 'relative',
    marginLeft: theme.spacing(-0.5),
    transform: 'translateX(15%)',
    opacity: ({ showParking }) => (showParking ? '1' : '0'),
    transition: theme.transitions.create('opacity'),
    '&.Mui-disabled': {
      pointerEvents: 'unset',
      cursor: 'not-allowed',
      opacity: ({ showParking }) => (showParking ? '0.5' : '0'),
    },
  },
  pulsation: {
    animation: '$pulsate 800ms infinite',
  },
  '@keyframes pulsate': {
    '0%': {
      opacity: '1',
    },
    '50%': {
      opacity: '0.3',
    },
    '100%': {
      opacity: '1',
    },
  },
  hover: {
    '&:hover img': {
      opacity: theme.palette.mode === 'light' ? '0.54' : '1',
    },
  },
  badgeParking: {
    color: theme.palette.warning.main,
    position: 'absolute',
    top: '-2%',
    left: '-2%',
    width: '1.1rem',
    height: '1.1rem',
    zIndex: '2',
  },
}));

const { FF_PARKING } = baseFlags;

const DayHeader = ({
  date,
  isHoliday,
  highlight,
  presence,
  presences,
  tri,
  place,
  isPast,
  isClosed,
  persons,
  parkingSpots,
  ...props
}) => {
  const isPresent = Boolean(presence?.spot);
  const [dialogOpen, setDialogOpen] = React.useState();
  const [fastOpen, setFastOpen] = React.useState(false);
  const [showParking, setShowParking] = React.useState(true);
  const classes = useStyles(({ showParking }));
  const dateObj = dayjs(date);
  const { day = dayjs().format('YYYY-MM-DD') } = useParams();

  const currentPlan = usePlan({ Name: place });
  const currentPlanUuid = currentPlan?.uuid;

  const enableParking = isEnable(FF_PARKING);

  const parkingPresences = presences
    .filter(({ spot }) => parkingSpots.map(({ Identifiant }) => Identifiant).includes(spot));
  const isParkingPending = parkingPresences
    .some(({ tri: t, fake }) => sameLowC(tri, t) && fake);
  const isParkingPresent = parkingPresences
    .some(({ tri: t }) => sameLowC(tri, t));

  const parkingAvailable = parkingSpots
    .map(({ Identifiant: spotIdentifiant }) => spotIdentifiant)
    .filter(id => !presences.map(({ spot }) => spot).includes(id));
  const isParkingFull = parkingSpots
    .map(({ Identifiant: spotIdentifiant }) => spotIdentifiant)
    .filter(id => !presences
      .filter(({ tri: t }) => !sameLowC(t, tri))
      .map(({ spot }) => spot)
      .includes(id)).length === 0;

  useEffect(() => {
    if ((presences && isParkingPresent) || (isPresent && date === day)) {
      setShowParking(true);
    }

    if ((!isPresent && !isParkingPresent) || (date !== day && !isParkingPresent)) {
      setShowParking(false);
    }
  }, [presences, isParkingPresent, date, day, isPresent]);

  const { setPresence } = usePresences(place);

  const handlePresence = event => {
    event.stopPropagation();
    if (isPresent) {
      setShowParking(false);
      // Delete ALL presences for this user on this day (poste + parking)
      presences
        .filter(presence => sameLowC(presence.tri, tri))
        .forEach(presence => setPresence({ ...presence, spot: null }));
      return null;
    }
    // May create presence
    if (event.ctrlKey || event.metaKey) {
      setFastOpen(true);
    }
    setDialogOpen(true);

    return null;
  };

  const [removeParkingIcon, setRemoveParkingIcon] = useState(false);

  const handleHoverParking = showRemoveIcon => {
    if (!isParkingPending && isParkingPresent) {
      setRemoveParkingIcon(showRemoveIcon);
    }
  };

  const handleParking = event => {
    event.stopPropagation();
    if (!isParkingPresent) {
      setPresence({
        day: date,
        tri,
        plan: place,
        presencePlan: currentPlanUuid ? [currentPlanUuid] : undefined,
        spot: parkingAvailable[0],
        period: 'fullday',
      });
    } else {
      setRemoveParkingIcon(false);
      setShowParking(false);
      parkingPresences
        .filter(p => sameLowC(p.tri, tri))
        .forEach(p => setPresence({ ...p, spot: null }));
    }
  };

  const handleDialogClose = React.useCallback((...args) => {
    const {
      0: spotId,
      [args.length - 2]: parkingSlot,
      [args.length - 1]: periodPref,
    } = args;
    if (spotId) {
      setPresence({
        day: date,
        tri,
        plan: place,
        presencePlan: currentPlanUuid ? [currentPlanUuid] : undefined,
        spot: spotId,
        period: periodPref,
      });
      // === TO ADD AFTER UPGRADING TO REACT 18 ===
      // toast.success(`Inscription au poste ${spotId}`, {
      //   description:
      //  `${Days[(dateObj.day()) % 7]} ${dateObj.date().toString()} ${Months[dateObj.month()]}`,
      // });
    }
    if (parkingSlot && !isParkingPresent) {
      setPresence({
        day: date,
        tri,
        plan: place,
        presencePlan: currentPlanUuid ? [currentPlanUuid] : undefined,
        spot: parkingSlot,
        period: periodPref,
      });
    }
    setDialogOpen(false);
    setFastOpen(false);
  }, [date, place, currentPlanUuid, setPresence, tri, isParkingPresent]);

  const isConflict = Boolean(
    presences
      .filter(({ tri: triPresence, spot, period }) =>
        triPresence !== tri && spot === presence?.spot && period === presence?.period)
      .length,
  );

  const getParkingButtonSrc = () => {
    if (removeParkingIcon) return '/remove_parking.svg';
    if (!isParkingPending && isParkingPresent) return '/parking_ok.svg';
    return '/add_parking.svg';
  };

  const getParkingButtonTooltip = () => {
    if (isParkingFull) return 'Parking complet';
    if (isParkingPending) return 'En cours d\'inscription ...';
    if (isParkingPresent) return 'Se désinscrire du parking';
    return 'S\'inscrire au parking';
  };

  const tooltipEnterDelay = 700; // ms

  return (
    <>
      <CardHeader
        subheader={(
          <>
            {isConflict && (
            <Tooltip
              title="Vous êtes inscrits à plusieurs sur le même poste"
              placement="right"
            >
              <ErrorOutline className={classes.badge} />
            </Tooltip>
            )}
            <strong className={classes.dayName}>{Days[(dateObj.day()) % 7]}</strong>{' '}
            {dateObj.date().toString()}{' '}
            {Months[dateObj.month()]}
            {isClosed && (
              <span className={classes.personsPresent}>{`(${persons})`}</span>
            )}

          </>
        )}
        action={(!isHoliday && !isPast) && (
          <Box
            className={classes.hover}
            onMouseEnter={() => setShowParking(true)}
            onMouseLeave={() => {
              if ((!isPresent && !isParkingPresent)
                || (date !== day && isPresent && !isParkingPresent)) {
                setShowParking(false);
              }
            }}
          >

            {enableParking && (
              <Tooltip
                title={getParkingButtonTooltip()}
                enterNextDelay={tooltipEnterDelay}
                enterDelay={tooltipEnterDelay}
              >
                <span>
                  <IconButton
                    size="small"
                    onClick={handleParking}
                    className={clsx({
                      [classes.parkingButton]: true,
                      [classes.pulsation]: isParkingPending,
                    })}
                    onMouseEnter={() => handleHoverParking(true)}
                    onMouseLeave={() => handleHoverParking(false)}
                    disabled={isParkingFull || !showParking}
                  >
                    {isParkingPresent && !isPresent && (
                    <Warning className={classes.badgeParking} />
                    )}
                    <img
                      alt="parking button"
                      src={getParkingButtonSrc()}
                      className={classes.svg}
                    />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            <Tooltip
              title={!isPresent ? 'S\'inscrire à un poste' : 'Se désinscrire du poste'}
              enterNextDelay={tooltipEnterDelay}
              enterDelay={tooltipEnterDelay}
            >
              <IconButton
                onClick={handlePresence}
                size="small"
              >
                {isPresent ? <RemoveCircleOutline /> : <AddCircleOutline />}
              </IconButton>
            </Tooltip>
          </Box>
        )}
        className={clsx(
          classes.cardHeader,
          {
            [classes.highlight]: highlight,
            [classes.conflict]: isConflict,
          },
        )}
        {...props}
      />
      {dialogOpen && (
        <SpotDialog
          open={dialogOpen}
          fastOpen={fastOpen}
          onClose={handleDialogClose}
          place={place}
          date={date}
          displayFavorite
        />
      )}
    </>
  );
};

export default React.memo(DayHeader);
