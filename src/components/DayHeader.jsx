import clsx from 'clsx';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

import { AddCircleOutline, ErrorOutline, RemoveCircleOutline, Warning } from '@mui/icons-material';
import { Box, CardHeader, IconButton, Tooltip } from '@mui/material';
import { emphasize } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';

import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { sameLowC } from '../helpers';
import usePresences from '../hooks/usePresences';
import { Days, Months } from '../settings';
import SpotDialog from './SpotDialog';

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
  lowVisisble: {
    // opacity: theme.palette.mode === 'light' ? '0.2' : '0.4',
    // transition: theme.transitions.create('all'),
    // '&:hover': {
    //   opacity: theme.palette.mode === 'light' ? '0.54' : '1',
    // },
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
    color: theme.palette.error.main,
    position: 'absolute',
    top: '0%',
    left: '0%',
    width: '1rem',
    height: '1rem',
    zIndex: '2',
  },
}));

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
  const [showParking, setShowParking] = React.useState(false);
  const classes = useStyles(({ showParking }));
  const dateObj = dayjs(date);
  const { day = dayjs().format('YYYY-MM-DD') } = useParams();

  const parkingPresences = presences
    .filter(({ spot }) => parkingSpots.map(({ Identifiant }) => Identifiant).includes(spot));
  const isParkingPending = parkingPresences
    .some(({ tri: t, fake }) => sameLowC(tri, t) && fake);
  const isParkingPresent = parkingPresences
    .some(({ tri: t }) => sameLowC(tri, t));

  const parkingAvailable = parkingSpots
    .map(({ Identifiant: spotIdentifiant }) => spotIdentifiant)
    .filter(id => !presences.map(({ spot }) => spot).includes(id));

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
      // Delete presence
      return setPresence({ ...presence, spot: null });
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
      setPresence({ day: date, tri, plan: place, spot: spotId, period: periodPref });
      // === TO ADD AFTER UPGRADING TO REACT 18 ===
      // toast.success(`Inscription au poste ${spotId}`, {
      //   description:
      //  `${Days[(dateObj.day()) % 7]} ${dateObj.date().toString()} ${Months[dateObj.month()]}`,
      // });
    }
    if (parkingSlot && !isParkingPresent) {
      setPresence({ day: date, tri, plan: place, spot: parkingSlot, period: periodPref });
    }
    setDialogOpen(false);
    setFastOpen(false);
  }, [date, place, setPresence, tri, isParkingPresent]);

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
    if (!parkingAvailable.length) return 'Parking complet';
    if (isParkingPending) return 'En cours d\'inscription ...';
    if (isParkingPresent) return 'Se désincrire du parking';
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
                  disabled={!parkingAvailable.length || !showParking}
                >
                  {isParkingPresent && !isPresent && (
                    <Warning className={classes.badgeParking} />
                  )}
                  <img
                    alt="parking button"
                    src={getParkingButtonSrc()}
                    className={clsx({
                      [classes.svg]: true,
                    })}
                  />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip
              title={!isPresent ? 'S\'indcrire à un poste' : 'Se désincrire du poste'}
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
