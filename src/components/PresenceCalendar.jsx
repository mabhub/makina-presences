import React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import createPersistedState from 'use-persisted-state';

import useHolidays from '../hooks/useHolidays';
import usePresences from '../hooks/usePresences';

import useSpots from '../hooks/useSpots';
import DayCard from './DayCard';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(dayOfYear);

const useTriState = createPersistedState('tri');
const useWeekPrefs = createPersistedState('weekPref');
const useDayPrefs = createPersistedState('dayPrefs');
const usePastDays = createPersistedState('pastDays');

const useStyles = makeStyles(theme => {
  const maxWidth = mq => `@media (max-width: ${theme.breakpoints.values[mq]}px)`;
  return { root: {
    width: '100%',
  },

  dayBox: {
    position: 'relative',
    margin: theme.spacing(1, 0),
    width: '100%',
  },

  newWeek: {},
  weekSeparator: {
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(0.5),
  },
  weekTextSeparator: {
    opacity: '.7',
  },
  firstWeek: {
    [maxWidth('sm')]: {
      marginTop: theme.spacing(0),
    },
  },
  holidayCard: {
    opacity: 0.85,
  },
  past: {
    opacity: 0.40,
  },
  dayCard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    border: theme.palette.mode === 'light' ? '1px solid #00000030' : '1px solid #ededed30',
    borderRadius: '10px',
  },
  todayCard: {
    border: `3px solid ${theme.palette.primary.main}`,
  },
  cardContent: {
    flex: 1,
    display: 'flex',
    background: theme.palette.secondary.fg,
    fontSize: theme.typography.pxToRem(10),
    padding: theme.spacing(1),
    '&:last-child': {
      paddingBottom: theme.spacing(1),
    },
  },
  holiday: {
    textAlign: 'center',
    fontSize: '1rem',
    fontStyle: 'italic',
    alignSelf: 'center',
  } };
});

const PresenceCalendar = () => {
  const classes = useStyles();
  const [tri] = useTriState('');
  const [weekPref] = useWeekPrefs('2');
  const [dayPrefs] = useDayPrefs(['L', 'M', 'Me', 'J', 'V']);
  const [showPastDays] = usePastDays();
  const { place, day = dayjs().format('YYYY-MM-DD') } = useParams();
  const history = useHistory();

  const cumulativeSpot = useSpots(place).filter(({ Cumul }) => Cumul);

  let timespan = 14;
  if ([1, 2, 3].includes(parseInt(weekPref, 10))) timespan = parseInt(weekPref, 10) * 7;

  const today = dayjs(dayjs().format('YYYY-MM-DD')); // Wacky trick to strip time

  const { presences } = usePresences(place);
  const holidays = useHolidays();

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

  // 0 = sunday, 6 = saturday
  const days = ['S', 'L', 'M', 'Me', 'J', 'V', 'S'];

  return (
    <Box spacing={2} className={classes.root}>
      {dayGrid.map((dayProps, index) => (
        <DayCard
          key={dayProps.isoDate}
          {...dayProps}
          index={index}
          dayPrefs={dayPrefs}
          tri={tri}
          cumulativeSpot={cumulativeSpot}
          holidays={holidays}
          presences={presences}
          day={day}
          showPastDays={showPastDays}
          today={today}
          history={history}
          place={place}
          classes={classes}
          days={days}
        />
      ))}
    </Box>
  );
};

export default React.memo(PresenceCalendar);
