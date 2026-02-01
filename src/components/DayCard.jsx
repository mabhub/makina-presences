import React from 'react';
import clsx from 'clsx';
import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import createPersistedState from 'use-persisted-state';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { displayCard } from '../helpers';
import WeekSeparator from './WeekSeparator';
import DayCardContainer from './DayCardContainer';
import useFavoriteDay from '../hooks/useFavoriteDay';
import useTodayPresences from '../hooks/useTodayPresences';
import useCurrentUserPresence from '../hooks/useCurrentUserPresence';
import usePlan from '../hooks/usePlan';
import useSpots from '../hooks/useSpots';
import useHolidays from '../hooks/useHolidays';
import usePresences from '../hooks/usePresences';

// Static array for day labels (0 = Sunday, 6 = Saturday)
const days = ['S', 'L', 'M', 'Me', 'J', 'V', 'S'];

// Styles specific to DayCard container
const useStyles = makeStyles(theme => ({
  dayBox: {
    position: 'relative',
    margin: theme.spacing(1, 0),
    width: '100%',
  },
  newWeek: {},
}));

const useTriState = createPersistedState('tri');
const useDayPrefs = createPersistedState('dayPrefs');
const usePastDays = createPersistedState('pastDays');

/**
 * DayCard component: Renders a single day in the presence calendar.
 *
 * @param {Object} props - Component props.
 * @param {string} props.isoDate - ISO date string (YYYY-MM-DD) for the day.
 * @param {number} props.weekIndex - ISO week number for the day.
 * @param {number} props.weekDayIndex - Day index in the week (0=Sunday).
 * @param {boolean} props.isPast - True if the day is in the past.
 * @param {number} props.index - Index of the day in the grid.
 * @returns {JSX.Element|null} The rendered day card or null for weekends.
 */
const DayCard = ({
  isoDate,
  weekIndex,
  weekDayIndex,
  isPast,
  index,
}) => {
  const [tri] = useTriState('');
  const [dayPrefs] = useDayPrefs(['L', 'M', 'Me', 'J', 'V']);
  const [showPastDays] = usePastDays();
  const { place, day = dayjs().format('YYYY-MM-DD') } = useParams();

  const currentPlan = usePlan({ Name: place });
  const cumulativeSpot = useSpots(currentPlan?.uuid).filter(({ Cumul }) => Cumul);
  const today = dayjs(dayjs().format('YYYY-MM-DD'));
  const { presences } = usePresences(place);
  const holidays = useHolidays();

  const classes = useStyles();
  const dayLabel = days[weekDayIndex];
  const dayIsFavorite = useFavoriteDay(dayLabel, dayPrefs);

  const holiday = holidays[isoDate];
  const isHoliday = Boolean(holiday);

  // Use custom hooks for presences logic
  const todayPresences = useTodayPresences(isoDate, presences);
  const currentTodayPresences = useCurrentUserPresence(todayPresences, tri, cumulativeSpot);

  const isToday = isoDate === today.format('YYYY-MM-DD');
  const newWeek = Boolean(weekDayIndex === 1);

  // Determine if the card should be displayed
  const showCard = displayCard({
    isPast,
    isHoliday,
    isoDate,
    dayIsFavorite,
    selectedDay: day,
    showPastDays,
  });

  // Skip rendering for Saturday (6) and Sunday (0)
  if (weekDayIndex === 6 || weekDayIndex === 0) {
    return <React.Fragment key={isoDate} />;
  }

  return (
    <Box
      key={isoDate}
      className={clsx(
        classes.dayBox,
        { [classes.newWeek]: newWeek },
      )}
    >
      {newWeek && (
        <WeekSeparator
          weekIndex={weekIndex}
          isFirstWeek={index === 1}
        />
      )}

      <DayCardContainer
        isoDate={isoDate}
        isToday={isToday}
        isPast={isPast}
        isHoliday={isHoliday}
        holiday={holiday}
        todayPresences={todayPresences}
        currentTodayPresences={currentTodayPresences}
        tri={tri}
        place={place}
        showCard={showCard}
        cumulativeSpot={cumulativeSpot}
      />
    </Box>
  );
};

export default React.memo(DayCard);
