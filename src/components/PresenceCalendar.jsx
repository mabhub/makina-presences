import React from 'react';
import clsx from 'clsx';

import createPersistedState from 'use-persisted-state';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

import usePresences from '../hooks/usePresences';
import useHolidays from '../hooks/useHolidays';

import { sameLowC } from '../helpers';

import Moment from './Moment';
import DayHeader from './DayHeader';
import TodayBadge from './TodayBadge';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(dayOfYear);

const useTriState = createPersistedState('tri');
const useDayState = createPersistedState('day');
const usePlaceState = createPersistedState('place');

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },

  dayBox: {
    position: 'relative',
    margin: theme.spacing(2, 0),
    width: '100%',
  },

  newWeek: {},
  weekIndex: {
    fontStyle: 'italic',
    fontSize: '0.7em',
    position: 'absolute',
    top: 0,
    right: theme.spacing(2),
    zIndex: 1,
    transform: 'translateY(-50%)',
    borderRadius: '5px',
    padding: theme.spacing(0, 1),
    background: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    boxShadow: theme.shadows[1],
    opacity: 0.2,
    transition: theme.transitions.create('opacity'),
    cursor: 'default',
    '&:hover': {
      opacity: 0.8,
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
  },
  cardContent: {
    flex: 1,
    display: 'flex',

    background: '#f5f5f5',
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
  },
}));

const timespan = 14;

const PresenceCalendar = () => {
  const classes = useStyles();
  const [tri] = useTriState('');
  const [place] = usePlaceState('Toulouse');

  const today = dayjs(dayjs().format('YYYY-MM-DD')); // Wacky trick to strip time
  const [day, setDay] = useDayState(today.format('YYYY-MM-DD'));

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

  return (
    <Box spacing={2} className={classes.root}>
      {dayGrid.map(({
        isoDate,
        weekIndex,
        weekDayIndex,
        isPast,
      }) => {
        /**
        * saturday,
        * last day of (sunday started) week
        */
        if (weekDayIndex === 6) {
          return <React.Fragment key={isoDate} />;
        }

        /**
        * sunday
        */
        if (weekDayIndex === 0) {
          return <React.Fragment key={isoDate} />;
        }

        const holiday = holidays[isoDate];
        const isHoliday = Boolean(holiday);

        const todayPresences = presences.filter(({ day: d }) => (d === isoDate));
        const currentTodayPresences = todayPresences
          .find(({ tri: t }) => sameLowC(t, tri));

        const isToday = isoDate === today.format('YYYY-MM-DD');

        const newWeek = Boolean(weekDayIndex === 1);

        return (
          <Box
            key={isoDate}
            className={clsx(
              classes.dayBox,
              { [classes.newWeek]: newWeek },
            )}
          >
            {newWeek && (
              <Box className={classes.weekIndex}>
                <>s{weekIndex}</>
              </Box>
            )}

            {isToday && (
              <TodayBadge />
            )}

            <Card
              className={clsx({
                [classes.dayCard]: true,
                [classes.past]: isPast,
                [classes.holidayCard]: isHoliday,
              })}
            >
              <CardActionArea onClick={() => setDay(isoDate)} disableRipple component="div">
                <DayHeader
                  date={isoDate}
                  presence={currentTodayPresences}
                  tri={tri}
                  place={place}
                  isHoliday={isHoliday}
                  highlight={day === isoDate}
                  isPast={isPast}
                />

                <CardContent className={classes.cardContent}>
                  <Grid container spacing={2}>
                    {isHoliday && (
                      <Grid item xs={12} className={classes.holiday}>
                        Jour férié<br />
                        ({holiday})
                      </Grid>
                    )}

                    {!isHoliday && (
                      <Moment
                        momentPresences={todayPresences.filter(({ spot: m }) => m)}
                        userPresence={currentTodayPresences}
                      />
                    )}
                  </Grid>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>
        );
      })}
    </Box>
  );
};

export default React.memo(PresenceCalendar);
