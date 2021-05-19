import React from 'react';
import clsx from 'clsx';

import { Avatar, CardHeader } from '@material-ui/core';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import { makeStyles } from '@material-ui/core/styles';

import DayPresenceButton from './DayPresenceButton';

const useStyles = makeStyles(theme => ({
  avatar: {
    background: theme.palette.grey[400],
  },
  holidayAvatar: {
    background: theme.palette.grey[200],
  },
  todayAvatar: {
    backgroundColor: theme.palette.primary.main,
  },
  cardHeader: {
    padding: theme.spacing(2, 2, 1),
  },
  today: {
    backgroundColor: emphasize(theme.palette.primary.main, 0.75),
  },
}));

const DayHeader = ({
  currentTodayPresences,
  date,
  dateString,
  dayInitial,
  dayLongPresence,
  dayName,
  isDateToday,
  isHoliday,
  isTriValid,
  ...props
}) => {
  const classes = useStyles();

  return (
    <CardHeader
      avatar={(
        <Avatar
          className={clsx({
            [classes.avatar]: true,
            [classes.holidayAvatar]: isHoliday,
            [classes.todayAvatar]: isDateToday,
          })}
        >
          {dayInitial}
        </Avatar>
      )}
      title={dayName}
      subheader={dateString}
      action={(!isHoliday && isTriValid) && (
        <DayPresenceButton
          date={date}
          unsub={dayLongPresence}
          userPresence={currentTodayPresences}
        />
      )}
      className={clsx(
        classes.cardHeader,
        { [classes.today]: isDateToday },
      )}
      {...props}
    />
  );
};

export default DayHeader;
