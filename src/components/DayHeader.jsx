import React from 'react';
import clsx from 'clsx';

import { CardHeader, IconButton } from '@material-ui/core';
import { RemoveCircleOutline, AddCircleOutline } from '@material-ui/icons';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import { makeStyles } from '@material-ui/core/styles';

import PresenceContext from './PresenceContext';
import { Days, Months } from '../settings';
import SpotDialog from './SpotDialog';

const useStyles = makeStyles(theme => ({
  cardHeader: {
    padding: theme.spacing(1.5, 1.5, 0.25, 2),
  },

  dayName: {
    textTransform: 'capitalize',
  },

  highlight: {
    backgroundColor: emphasize(theme.palette.primary.main, 0.25),
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
  ...props
}) => {
  const classes = useStyles();
  const isPresent = Boolean(presence?.spot);
  const [dialogOpen, setDialogOpen] = React.useState();

  const setPresence = React.useContext(PresenceContext);

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

  const handleDialogClose = React.useCallback(value => {
    setDialogOpen(false);
    if (value) {
      // Create présence
      setPresence({ day: date, tri, plan: place, spot: value });
    }
  }, [date, place, setPresence, tri]);

  return (
    <>
      <CardHeader
        subheader={(
          <>
            <strong className={classes.dayName}>{Days[(date.day()) % 7]}</strong>{' '}
            {date.date().toString()}{' '}
            {Months[date.month()]}
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
        />
      )}
    </>
  );
};

export default DayHeader;
