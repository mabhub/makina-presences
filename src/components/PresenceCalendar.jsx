import React from 'react';
import clsx from 'clsx';

import createPersistedState from 'use-persisted-state';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import {
  Card,
  CardActionArea,
  CardContent,
  Grid,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import usePresences from '../hooks/usePresences';
import useHolidays from '../hooks/useHolidays';

import { sameLowC } from '../helpers';

import Moment from './Moment';
import DayHeader from './DayHeader';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(dayOfYear);

const useTriState = createPersistedState('tri');
const useDayState = createPersistedState('day');
const usePlaceState = createPersistedState('place');

const useStyles = makeStyles(theme => ({
  week: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: '0.8em',
    alignSelf: 'center',
  },
  holidayCard: {
    opacity: 0.85,
  },
  day: {
    display: 'flex',
  },
  past: {
    opacity: 0.45,
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
  const [day, setDay] = useDayState(today);

  const { presences } = usePresences(place);
  const holidays = useHolidays();

  const dayGrid = [...Array(timespan).keys()].map(index => {
    const date = today.day(index);
    const isoDate = date.format('YYYY-MM-DD');

    return {
      date,
      isoDate,
      weekIndex: date.day(1).isoWeek(),
      weekDayIndex: date.day(),
      isPast: date.isBefore(today),
      isDateToday: date.isSame(today),
    };
  });

  return (
    <Grid container spacing={2}>
      {dayGrid.map(({
        date,
        isoDate,
        weekIndex,
        weekDayIndex,
        isPast,
      }) => {
        /**
        * saturday,
        * last day of (sunday started) week
        * used as simple Grid spacer
        */
        if (weekDayIndex === 6) {
          return <React.Fragment key={isoDate} />;
        }

        /**
        * sunday,
        * used as simple Grid spacer
        * and for displaying week number
        */
        if (weekDayIndex === 0) {
          return (
            <Grid item xs={12} key={isoDate} className={classes.week}>
              s<strong>{weekIndex}</strong>
            </Grid>
          );
        }

        const holiday = holidays[isoDate];
        const isHoliday = Boolean(holiday);

        const todayPresences = presences.filter(({ day: d }) => (d === isoDate));
        const currentTodayPresences = todayPresences
          .find(({ tri: t }) => sameLowC(t, tri));

        const isPresent = Boolean(currentTodayPresences?.spot);

        return (
          <Grid item xs={12} key={isoDate} className={classes.day}>
            <Card
              className={clsx({
                [classes.dayCard]: true,
                [classes.past]: isPast,
                [classes.holidayCard]: isHoliday,
              })}
            >
              <CardActionArea onClick={() => setDay(isoDate)} disableRipple>
                <DayHeader
                  date={date}
                  isHoliday={isHoliday}
                  allowUnsub={!isPast && isPresent}
                  highlight={day === isoDate}
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
          </Grid>
        );
      })}
    </Grid>
  );
};

export default PresenceCalendar;
