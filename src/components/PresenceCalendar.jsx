import React from 'react';
import clsx from 'clsx';
import { useHistory, useParams } from 'react-router-dom';

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
  Collapse,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

import usePresences from '../hooks/usePresences';
import useHolidays from '../hooks/useHolidays';

import { sameLowC } from '../helpers';

import Moment from './Moment';
import DayHeader from './DayHeader';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(dayOfYear);

const useTriState = createPersistedState('tri');
const useWeekPrefs = createPersistedState('weekPref');
const useDayPrefs = createPersistedState('dayPrefs');
const usePastDays = createPersistedState('pastDays');

const useStyles = makeStyles(theme => ({
  root: {
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
  },
}));

const PresenceCalendar = () => {
  const classes = useStyles();
  const [tri] = useTriState('');
  const [weekPref] = useWeekPrefs('2');
  const [dayPrefs] = useDayPrefs(['L', 'M', 'Me', 'J', 'V']);
  const [showPastDays] = usePastDays();
  const { place, day = dayjs().format('YYYY-MM-DD') } = useParams();
  const history = useHistory();

  let timespan = 14;
  if ([1, 2, 3].includes(parseInt(weekPref, 10))) timespan = parseInt(weekPref, 10) * 7;

  const today = dayjs(dayjs().format('YYYY-MM-DD')); // Wacky trick to strip time

  const { presences } = usePresences(place);
  const holidays = useHolidays();

  const displayCard = (isPast, isHoliday, isoDate, dayIsFavorite) => {
    if (showPastDays === undefined) return true;
    if (isoDate === day || isHoliday) return true;
    if (dayIsFavorite && (!isPast || showPastDays)) return true;
    if (!dayIsFavorite && showPastDays && isPast) return true;
    return false;
  };

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

        const dayLabel = days[weekDayIndex];
        const dayIsFavorite = dayPrefs.some(d => d === dayLabel);

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
              <Divider
                className={classes.weekSeparator}
                textAlign="right"
              >
                <span className={classes.weekTextSeparator}>{`Semaine ${weekIndex}`}</span>
              </Divider>
            )}

            <Card
              className={clsx({
                [classes.dayCard]: true,
                [classes.todayCard]: isToday,
                [classes.past]: isPast,
                [classes.holidayCard]: isHoliday,
              })}
              elevation={0}
            >
              <CardActionArea
                onClick={() => history.push(`/${place}/${isoDate}`)}
                disableRipple
                component="div"
              >
                <DayHeader
                  date={isoDate}
                  presence={currentTodayPresences}
                  tri={tri}
                  place={place}
                  isHoliday={isHoliday}
                  highlight={day === isoDate}
                  isPast={isPast}
                  isClosed={!displayCard(isPast, isHoliday, isoDate, dayIsFavorite)}
                  persons={todayPresences.filter(({ spot: m }) => m).length}
                />
                <Collapse in={displayCard(isPast, isHoliday, isoDate, dayIsFavorite)}>
                  <CardContent className={classes.cardContent}>
                    <Grid container>
                      {isHoliday && (
                        <Grid item xs={12} className={classes.holiday}>
                          Jour férié<br />
                          ({holiday})
                        </Grid>
                      )}
                      {todayPresences.filter(({ spot: m }) => m).length === 0 && !isHoliday && (
                        <Grid item spacing="unset" sx={{ textAlign: 'center', width: '100%', opacity: '.5' }}>
                          Aucune personne présente
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
                </Collapse>
              </CardActionArea>
            </Card>
          </Box>
        );
      })}
    </Box>
  );
};

export default React.memo(PresenceCalendar);
