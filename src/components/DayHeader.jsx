import React from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';

import { CardHeader, IconButton } from '@mui/material';
import { RemoveCircleOutline, AddCircleOutline } from '@mui/icons-material';
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
}));

const DayHeader = ({
  date,
  isHoliday,
  highlight,
  presence,
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
  const mapping = useMapping();

  const { setPresence } = usePresences(mapping[place]);

  const handleAction = event => {
    if (isPresent) {
      // Delete presence
      setPresence({ ...presence, spot: null });
    } else {
      // May create presence
      setDialogOpen(true);
    }

    event.stopPropagation();
  };

  const handleDialogClose = React.useCallback((...args) => {
    const { 0: spotId, [args.length - 1]: periodPref } = args;
    setDialogOpen(false);
    if (spotId) {
      setPresence({ day: date, tri, plan: place, spot: spotId, period: periodPref });
    }
  }, [date, place, setPresence, tri]);

  const dateObj = dayjs(date);

  return (
    <>
      <CardHeader
        subheader={(
          <>
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
          { [classes.highlight]: highlight },
        )}
        {...props}
      />
      {dialogOpen && (
        <SpotDialog
          open={dialogOpen}
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
