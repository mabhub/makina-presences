import React from 'react';

import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import createPersistedState from 'use-persisted-state';

import DayCard from './DayCard';
import { getTimespan } from '../helpers';

// Extend dayjs with useful plugins for calendar logic
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
 * PresenceCalendar component: renders the main presence calendar grid.
 * - Computes the number of days to display based on user preferences.
 * - Generates the day grid.
 * - Delegates the rendering of each day to DayCard.
 *
 * @returns {JSX.Element} The calendar grid with one DayCard per day.
 */
const PresenceCalendar = () => {
  const classes = useStyles();
  const [weekPref] = useWeekPrefs('2');

  // Compute the number of days to display according to user preference
  const timespan = getTimespan(weekPref);

  // Get today's date without time (YYYY-MM-DD)
  const today = dayjs().startOf('day');

  /**
   * Generates the grid of days to display.
   * Each entry contains:
   * - isoDate: string (YYYY-MM-DD)
   * - weekIndex: ISO week number
   * - weekDayIndex: day of week (0=Sunday)
   * - isPast: boolean
   * - isDateToday: boolean
   */
  const dayGrid = React.useMemo(() => (
    Array.from({ length: timespan }, (_, index) => {
      const date = today.day(index);
      return {
        isoDate: date.format('YYYY-MM-DD'),
        weekIndex: date.day(1).isoWeek(),
        weekDayIndex: date.day(),
        isPast: date.isBefore(today),
        isDateToday: date.isSame(today),
      };
    })
  ), [timespan, today]);

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
