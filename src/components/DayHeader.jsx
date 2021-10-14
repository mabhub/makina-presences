import React from 'react';
import clsx from 'clsx';

import { Avatar, CardHeader } from '@material-ui/core';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import { makeStyles } from '@material-ui/core/styles';

import DayPresenceButton from './DayPresenceButton';
import { Days, Months } from '../settings';

const useStyles = makeStyles(theme => ({
  cardHeader: {
    padding: theme.spacing(2, 2, 1),
  },

  avatar: {
    background: theme.palette.grey[400],
  },
  holidayAvatar: {
    background: theme.palette.grey[200],
  },

  highlight: {
    backgroundColor: emphasize(theme.palette.primary.main, 0.75),
  },
  highlightAvatar: {
    backgroundColor: theme.palette.primary.main,
  },
}));

const DayHeader = ({
  date,
  isHoliday,
  isTriValid,
  highlight,
  ...props
}) => {
  const classes = useStyles();

  const dayName = Days[(date.day()) % 7];
  const dayInitial = dayName[0].toUpperCase();
  const dateString = `${date.date().toString()} ${Months[date.month()]}`;

  return (
    <CardHeader
      avatar={(
        <Avatar
          className={clsx({
            [classes.avatar]: true,
            [classes.holidayAvatar]: isHoliday,
            [classes.highlightAvatar]: highlight,
          })}
        >
          {dayInitial}
        </Avatar>
      )}
      title={dayName}
      subheader={dateString}
      action={(!isHoliday && isTriValid) && (
        <DayPresenceButton date={date} />
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
