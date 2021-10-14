import React from 'react';
import clsx from 'clsx';

import { CardHeader } from '@material-ui/core';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import { makeStyles } from '@material-ui/core/styles';

import DayPresenceButton from './DayPresenceButton';
import { Days, Months } from '../settings';

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
  allowUnsub,
  ...props
}) => {
  const classes = useStyles();

  return (
    <CardHeader
      subheader={(
        <>
          <strong>{Days[(date.day()) % 7]}</strong>{' '}
          {date.date().toString()}{' '}
          {Months[date.month()]}
        </>
      )}
      action={(!isHoliday && allowUnsub) && (
        <DayPresenceButton date={date} size="small" />
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
