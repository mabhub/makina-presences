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
  Container,
  Grid,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import usePresences from '../hooks/usePresences';
import useHolidays from '../hooks/useHolidays';

import { Days, Months } from '../settings';
import { asDayRef, sameLowC } from '../helpers';
import PresenceForm from './PresenceForm';
import Footer from './Footer';

import InitialNotice from './InitialNotice';
import Moment from './Moment';
import Plan from './Plan';
import PresenceContext from './PresenceContext';
import DayHeader from './DayHeader';
import LoadIndicator from './LoadIndicator';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(dayOfYear);

const useTriState = createPersistedState('tri');
const useDayState = createPersistedState('day');
const usePlaceState = createPersistedState('place');

const useStyles = makeStyles(theme => ({
  notice: {
    marginTop: theme.spacing(4),
  },
  container: {
    marginTop: theme.spacing(4),
  },
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
    borderRight: '4px solid transparent',
  },
  planDay: {
    borderColor: theme.palette.primary.main,
  },
  cardContent: {
    flex: 1,
    display: 'flex',

    background: '#f5f5f5',
    textAlign: 'center',
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

const PresencePage = () => {
  const classes = useStyles();
  const [tri] = useTriState('');
  const [place] = usePlaceState('Toulouse');

  const isTriValid = tri.length >= 3;

  const today = dayjs(dayjs().format('YYYY-MM-DD')); // Wacky trick to strip time
  const [day, setDay] = useDayState(today);
  const dayRefFrom = asDayRef(today.day(1));
  const dayRefTo = asDayRef(today.day(timespan));

  const { presences, setPresence } = usePresences(place, dayRefFrom, dayRefTo);
  const holidays = useHolidays();

  const dayGrid = [...Array(timespan).keys()].map(index => {
    const date = today.day(index);
    const isoDate = date.format('YYYY-MM-DD');
    const dayName = Days[(index) % 7];

    return {
      date,
      isoDate,
      dayName,
      weekIndex: date.day(1).isoWeek(),
      weekDayIndex: date.day(),
      isPast: date.isBefore(today),
      dayInitial: dayName[0].toUpperCase(),
      dateString: `${date.date().toString()} ${Months[date.month()]}`,
      isDateToday: date.isSame(today),
    };
  });

  return (
    <div className="PresencePage">
      <LoadIndicator />

      <PresenceForm />

      {!isTriValid && (
        <InitialNotice className={classes.notice} />
      )}

      <PresenceContext.Provider value={setPresence}>
        <Container className={classes.container}>
          <Grid container spacing={2} style={{ height: '80vh' }}>
            <Grid item xs={3} style={{ overflow: 'auto', height: '100%' }}>
              <Grid container spacing={2}>
                {dayGrid.map(({
                  date,
                  isoDate,
                  dayName,
                  weekIndex,
                  weekDayIndex,
                  isPast,
                  dayInitial,
                  dateString,
                  isDateToday,
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

                  const dayLongPresence = typeof currentTodayPresences?.spot === 'string';

                  return (
                    <Grid item xs={12} key={isoDate} className={classes.day}>
                      <Card
                        className={clsx({
                          [classes.dayCard]: true,
                          [classes.past]: isPast,
                          [classes.holidayCard]: isHoliday,
                          [classes.planDay]: day === isoDate,
                        })}
                      >
                        <CardActionArea onClick={() => setDay(isoDate)}>
                          <DayHeader
                            currentTodayPresences={currentTodayPresences}
                            date={date}
                            dateString={dateString}
                            dayInitial={dayInitial}
                            dayLongPresence={dayLongPresence}
                            dayName={dayName}
                            isDateToday={isDateToday}
                            isHoliday={isHoliday}
                            isTriValid={isTriValid}
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
            </Grid>

            <Grid item xs={9} style={{ height: '100%' }}>
              <Plan />
            </Grid>
          </Grid>
        </Container>
      </PresenceContext.Provider>

      <Footer />
    </div>
  );
};

export default PresencePage;
