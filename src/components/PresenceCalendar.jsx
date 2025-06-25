import React from 'react';

import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import createPersistedState from 'use-persisted-state';

import DayCard from './DayCard';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(dayOfYear);

const useWeekPrefs = createPersistedState('weekPref');

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
  },
}));

/**
 * PresenceCalendar component: Renders the main presence calendar grid.
 * Computes the number of days to display based on user preferences,
 * generates the day grid, and delegates the rendering of each day to DayCard.
 *
 * @returns {JSX.Element} The calendar grid with one DayCard per day.
 */
const PresenceCalendar = () => {
  const classes = useStyles();
  const [weekPref] = useWeekPrefs('2');

  // Compute the number of days to display according to user preference
  let timespan = 14;
  if ([1, 2, 3].includes(parseInt(weekPref, 10))) {
    timespan = parseInt(weekPref, 10) * 7;
  }

  // Get today's date without time
  const today = dayjs(dayjs().format('YYYY-MM-DD'));

  // Generate the grid of days to display
  const dayGrid = [...Array(timespan).keys()].map(index => {
    const date = today.day(index);
    const isoDate = date.format('YYYY-MM-DD');

    return {
      isoDate,
      weekIndex: date.day(1).isoWeek(),
      weekDayIndex: date.day(),
      isPast: date.isBefore(today),
      isDateToday: date.isSame(today),
    };
  });

  return (
    <Box spacing={2} className={classes.root}>
      {dayGrid.map((dayProps, index) => (
        <DayCard
          key={dayProps.isoDate}
          {...dayProps}
          index={index}
        />
      ))}
    </Box>
  );
};

export default React.memo(PresenceCalendar);
