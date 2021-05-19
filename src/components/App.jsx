import React from 'react';
import clsx from 'clsx';

import createPersistedState from 'use-persisted-state';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import {
  Card,
  CardContent,
  Container,
  Grid,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import usePresences from '../hooks/usePresences';
import useHolidays from '../hooks/useHolidays';

import { placesId, fieldMap, Days, Months } from '../settings';
import { asDayRef, sameLowC } from '../helpers';
import Header from './Header';
import Footer from './Footer';

import InitialNotice from './InitialNotice';
import Moment from './Moment';
import PresenceContext from './PresenceContext';
import DayHeader from './DayHeader';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(dayOfYear);

const useTriState = createPersistedState('tri');
const usePlaceState = createPersistedState('place');

const useStyles = makeStyles(theme => ({
  notice: {
    marginTop: theme.spacing(4),
  },
  container: {
    marginTop: theme.spacing(4),
  },
  week: {
    textAlign: 'right',
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

const validPlaces = Object.keys(placesId);
const timespan = 21;

const App = () => {
  const classes = useStyles();
  const [tri] = useTriState('');
  const [place, setPlace] = usePlaceState(validPlaces[0]);
  if (!validPlaces.includes(place)) { setPlace(validPlaces[0]); }
  const { [place]: { DATE, MATIN, MIDI, APREM, TRI } } = fieldMap;

  const isTriValid = tri.length >= 3;

  const today = dayjs(dayjs().format('YYYY-MM-DD')); // Wacky trick to strip time
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
    <div className="App">
      <Header />

      {!isTriValid && (
        <InitialNotice className={classes.notice} />
      )}

      <PresenceContext.Provider value={setPresence}>
        <Container className={classes.container}>
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
                return (
                  <Grid item xs={12} lg={1} key={isoDate} />
                );
              }

              /**
               * sunday,
               * used as simple Grid spacer
               * and for displaying week number
               */
              if (weekDayIndex === 0) {
                return (
                  <Grid item xs={12} sm={6} md={4} lg={1} key={isoDate} className={classes.week}>
                    s<strong>{weekIndex}</strong>
                  </Grid>
                );
              }

              const holiday = holidays[isoDate];
              const isHoliday = Boolean(holiday);

              const todayPresences = presences.filter(({ [DATE]: d }) => (d === isoDate));
              const currentTodayPresences = todayPresences.find(({ [TRI]: t }) => sameLowC(t, tri));
              const dayLongPresence = currentTodayPresences?.[MATIN]
                && currentTodayPresences?.[MIDI]
                && currentTodayPresences?.[APREM];

              return (
                <Grid item xs={12} sm={6} md={4} lg={2} key={isoDate} className={classes.day}>
                  <Card
                    className={clsx({
                      [classes.dayCard]: true,
                      [classes.past]: isPast,
                      [classes.holidayCard]: isHoliday,
                    })}
                  >
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

                        {!isHoliday && [MATIN, MIDI, APREM].map(moment => (
                          <Moment
                            key={moment}
                            day={date}
                            moment={moment}
                            momentPresences={todayPresences.filter(({ [moment]: m }) => m)}
                            userPresence={currentTodayPresences}
                          />
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </PresenceContext.Provider>

      <Footer />
    </div>
  );
};

export default App;
