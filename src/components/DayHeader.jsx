import React from 'react';
import clsx from 'clsx';

import { CardHeader, IconButton } from '@material-ui/core';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import { makeStyles } from '@material-ui/core/styles';

import PresenceContext from './PresenceContext';
import { Days, Months } from '../settings';
import { SubscribeIcon, UnsubscribeIcon } from './SubscriptionIcon';

const useStyles = makeStyles(theme => ({
  cardHeader: {
    padding: theme.spacing(1.5, 1.5, 0.25),
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

  const setPresence = React.useContext(PresenceContext);

  const handleAction = event => {
    if (isPresent) {
      // Delete presence
      setPresence({ ...presence, spot: null });
    } else {
      // Create presence
      setPresence({ day: date, tri, plan: place, spot: 'XX' });
    }

    event.stopPropagation();
  };

  return (
    <CardHeader
      subheader={(
        <>
          <strong>{Days[(date.day()) % 7]}</strong>{' '}
          {date.date().toString()}{' '}
          {Months[date.month()]}
        </>
      )}
      action={(!isHoliday && !isPast) && (
        <IconButton onClick={handleAction} size="small">
          {isPresent ? <UnsubscribeIcon /> : <SubscribeIcon />}
        </IconButton>
      )}
      className={clsx(
        classes.cardHeader,
        { [classes.highlight]: highlight },
      )}
      {...props}
    />
  );
};

export default DayHeader;
