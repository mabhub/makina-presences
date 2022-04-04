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

const useStyles = makeStyles(theme => ({
  cardHeader: {
    padding: theme.spacing(1.5, 1.5, 0.25, 2),
  },

  dayName: {
    textTransform: 'capitalize',
  },

  highlight: {
    backgroundColor: emphasize(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0 : 0.25),
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

  const { setPresence } = usePresences(place);

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

  const dateObj = dayjs(date);

  return (
    <>
      <CardHeader
        subheader={(
          <>
            <strong className={classes.dayName}>{Days[(dateObj.day()) % 7]}</strong>{' '}
            {dateObj.date().toString()}{' '}
            {Months[dateObj.month()]}
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

export default React.memo(DayHeader);
