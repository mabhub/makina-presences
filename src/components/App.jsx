import React from 'react';
import clsx from 'clsx';

import createPersistedState from 'use-persisted-state';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { emphasize } from '@material-ui/core/styles/colorManipulator';

import usePresences from '../hooks/usePresences';
import useHolidays from '../hooks/useHolidays';

import { placesId, fieldMap, Days, Months } from '../settings';
import { asDayRef, nrmlStr, sameLowC } from '../helpers';
import Header from './Header';
import Footer from './Footer';

import { SubscribeIcon, UnsubscribeIcon } from './SubscriptionIcon';
import InitialNotice from './InitialNotice';
import Moment from './Moment';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(dayOfYear);

const useTriState = createPersistedState('tri');
const usePlaceState = createPersistedState('place');

const useStyles = makeStyles(theme => ({
  week: {
    textAlign: 'right',
    fontStyle: 'italic',
    fontSize: '0.8em',
    alignSelf: 'center',
  },
  holidayCard: {
    opacity: 0.85,
  },
  avatar: {
    background: theme.palette.grey[400],
  },
  holidayAvatar: {
    background: theme.palette.grey[200],
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
  today: {
    backgroundColor: emphasize(theme.palette.primary.main, 0.75),
  },
  todayAvatar: {
    backgroundColor: theme.palette.primary.main,
  },
  cardHeader: {
    padding: theme.spacing(2, 2, 1),
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

function App () {
  const classes = useStyles();
  const [tri] = useTriState('');
  const [place, setPlace] = usePlaceState(validPlaces[0]);

  if (!validPlaces.includes(place)) {
    setPlace(validPlaces[0]);
  }

  const today = dayjs();
  const days = [...Array(21)];
  const dayRefFrom = asDayRef(today.day(1));
  const dayRefTo = asDayRef(today.day(21));

  const { KEY, DATE, DAYREF, MATIN, MIDI, APREM, TRI } = fieldMap[place];
  const { presences, createRow, updateRow, deleteRow } = usePresences(place, dayRefFrom, dayRefTo);

  const triPresences = React.useMemo(
    () => presences.filter(({ [TRI]: t }) => sameLowC(t, tri)),
    [TRI, presences, tri],
  );

  const holidays = useHolidays();
  const cleanTri = tri.length <= 3 ? nrmlStr(tri) : tri.trim();

  const createPresence = React.useCallback(
    (date, moments) => {
      const isoDate = date.format('YYYY-MM-DD');
      return createRow.mutate({
        [KEY]: `${isoDate}-${cleanTri}`,
        [DATE]: isoDate,
        [DAYREF]: asDayRef(date),
        [TRI]: cleanTri,
        ...moments,
      });
    },
    [DATE, DAYREF, KEY, TRI, cleanTri, createRow],
  );

  const createDayPresence = React.useCallback(
    date => createPresence(date, { [MATIN]: true, [MIDI]: true, [APREM]: true }),
    [APREM, MATIN, MIDI, createPresence],
  );

  const deletePresence = React.useCallback(
    presence => deleteRow.mutate(presence),
    [deleteRow],
  );

  const fillPresence = React.useCallback(
    presence => updateRow.mutate({ ...presence, [MATIN]: true, [MIDI]: true, [APREM]: true }),
    [APREM, MATIN, MIDI, updateRow],
  );

  const editPresence = React.useCallback(
    (presence, changes) => updateRow.mutate({ ...presence, ...changes }),
    [updateRow],
  );

  const dayAdd = (date, changes) => () => {
    const presence = triPresences.find(({ [DATE]: d }) => (d === date.format('YYYY-MM-DD')));

    if (!changes) {
      if (presence) {
        if (!presence[MATIN] || !presence[MIDI] || !presence[APREM]) {
          return fillPresence(presence);
        }

        return deletePresence(presence);
      }

      return createDayPresence(date);
    }

    if (presence) {
      const newPresence = { ...presence, ...changes };

      if (!newPresence[MATIN] && !newPresence[MIDI] && !newPresence[APREM]) {
        return deletePresence(newPresence);
      }

      return editPresence({ ...presence, ...changes });
    }

    return createPresence(date, changes);
  };

  return (
    <div className="App">
      <Header />

      {tri.length < 3 && (
        <InitialNotice />
      )}

      <Container style={{ marginTop: '2rem' }}>
        <Grid container spacing={2}>
          {days.map((_, index) => {
            const currentDay = today.day(index);
            const dayIndex = currentDay.day();
            const isoDay = currentDay.format('YYYY-MM-DD');
            const holiday = holidays[isoDay];
            const isPast = currentDay.isBefore(today);

            const dayname = Days[(index) % 7];
            const dayInitial = dayname[0].toUpperCase();

            const date = `${currentDay.date().toString()} ${Months[currentDay.month()]}`;

            if (dayIndex === 6) {
              return (
                <Grid
                  item
                  xs={12}
                  lg={1}
                  key={currentDay.toString()}
                />
              );
            }

            if (dayIndex === 0) {
              return (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={1}
                  key={currentDay.toString()}
                  className={classes.week}
                >
                  s<strong>{currentDay.day(1).isoWeek()}</strong>
                </Grid>
              );
            }

            const todayPresences = presences.filter(({ [DATE]: d }) => (d === isoDay));
            const currentTodayPresences = todayPresences.find(
              ({ [TRI]: t }) => sameLowC(t, tri),
            ) || {};
            const dayLongPresence = currentTodayPresences[MATIN]
              && currentTodayPresences[MIDI]
              && currentTodayPresences[APREM];

            return (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={2}
                key={currentDay.toString()}
                className={classes.day}
              >
                <Card
                  className={clsx({
                    [classes.dayCard]: true,
                    [classes.past]: isPast,
                    [classes.holidayCard]: holiday,
                  })}
                >
                  <CardHeader
                    avatar={(
                      <Avatar
                        className={clsx(
                          classes.avatar,
                          {
                            [classes.holidayAvatar]: holiday,
                            [classes.todayAvatar]: today.isSame(currentDay),
                          },
                        )}
                      >
                        {dayInitial}
                      </Avatar>
                    )}
                    title={dayname}
                    subheader={date}
                    action={(!holiday && tri.length > 2) && (
                      <IconButton onClick={dayAdd(currentDay)}>
                        {dayLongPresence
                          ? <UnsubscribeIcon />
                          : <SubscribeIcon />}
                      </IconButton>
                    )}
                    className={clsx(
                      classes.cardHeader,
                      { [classes.today]: today.isSame(currentDay) },
                    )}
                  />

                  <CardContent className={classes.cardContent}>
                    <Grid container spacing={2}>
                      {holiday && (
                        <Grid item xs={12} className={classes.holiday}>
                          Jour férié<br />
                          ({holiday})
                        </Grid>
                      )}

                      {!holiday && [MATIN, MIDI, APREM].map(moment => (
                        <Moment
                          key={moment}
                          day={currentDay}
                          dayAdd={dayAdd}
                          moment={moment}
                          presences={todayPresences.filter(({ [moment]: m }) => m)}
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

      <Footer />
    </div>
  );
}

export default App;
