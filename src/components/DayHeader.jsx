import clsx from 'clsx';
import dayjs from 'dayjs';
import React from 'react';

import { AddCircleOutline, ErrorOutline, RemoveCircleOutline } from '@mui/icons-material';
import { CardHeader, IconButton, Tooltip } from '@mui/material';
import { emphasize } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';

import usePresences from '../hooks/usePresences';
import { Days, Months } from '../settings';
import SpotDialog from './SpotDialog';
import useMapping from '../hooks/useMapping';

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
  ...props
}) => {
  const classes = useStyles();
  const isPresent = Boolean(presence?.spot);
  const [dialogOpen, setDialogOpen] = React.useState();
  const [fastOpen, setFastOpen] = React.useState(false);
  const mapping = useMapping();

  const { setPresence } = usePresences(mapping[place]);

  const handleAction = event => {
    event.stopPropagation();
    if (isPresent) {
      // Delete presence
      return setPresence({ ...presence, spot: null });
    }
    // May create presence
    if (event.ctrlKey) {
      setFastOpen(true);
    }
    setDialogOpen(true);

    return null;
  };

  const dateObj = dayjs(date);

  const handleDialogClose = React.useCallback((...args) => {
    const { 0: spotId, [args.length - 1]: periodPref } = args;
    if (spotId) {
      setPresence({ day: date, tri, plan: place, spot: spotId, period: periodPref });
      // === TO ADD AFTER UPGRADING TO REACT 18 ===
      // toast.success(`Inscription au poste ${spotId}`, {
      //   description:
      //  `${Days[(dateObj.day()) % 7]} ${dateObj.date().toString()} ${Months[dateObj.month()]}`,
      // });
    }
    setDialogOpen(false);
    setFastOpen(false);
  }, [date, place, setPresence, tri]);

  const isConflict = Boolean(
    presences
      .filter(({ tri: triPresence, spot, period }) =>
        triPresence !== tri && spot === presence?.spot && period === presence?.period)
      .length,
  );

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
          <IconButton onClick={handleAction} size="small">
            {isPresent ? <RemoveCircleOutline /> : <AddCircleOutline />}
          </IconButton>
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
