import React from 'react';
import clsx from 'clsx';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Collapse,
  Divider,
  Grid,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import createPersistedState from 'use-persisted-state';
import dayjs from 'dayjs';
import { useHistory, useParams } from 'react-router-dom';
import { displayCard } from '../helpers';
import DayHeader from './DayHeader';
import Moment from './Moment';
import HolidayBanner from './HolidayBanner';
import NoPresenceMessage from './NoPresenceMessage';
import useFavoriteDay from '../hooks/useFavoriteDay';
import useTodayPresences from '../hooks/useTodayPresences';
import useCurrentUserPresence from '../hooks/useCurrentUserPresence';
import useSpots from '../hooks/useSpots';
import useHolidays from '../hooks/useHolidays';
import usePresences from '../hooks/usePresences';

// Static array for day labels (0 = Sunday, 6 = Saturday)
const days = ['S', 'L', 'M', 'Me', 'J', 'V', 'S'];

// Styles specific to DayCard and its children
const useStyles = makeStyles(theme => {
  const maxWidth = mq => `@media (max-width: ${theme.breakpoints.values[mq]}px)`;
  return {
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
    },
  };
});

const useTriState = createPersistedState('tri');
const useDayPrefs = createPersistedState('dayPrefs');
const usePastDays = createPersistedState('pastDays');

/**
 * Renders a single day in the presence calendar.
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
  const history = useHistory();

  const cumulativeSpot = useSpots(place).filter(({ Cumul }) => Cumul);
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
        <Divider
          className={clsx({
            [classes.weekSeparator]: true,
            [classes.firstWeek]: index === 1,
          })}
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
            presences={todayPresences}
            tri={tri}
            place={place}
            isHoliday={isHoliday}
            highlight={day === isoDate}
            isPast={isPast}
            isClosed={!showCard}
            persons={todayPresences.filter(({ spot: m }) => m).length}
            parkingSpots={cumulativeSpot}
          />
          <Collapse in={showCard}>
            <CardContent className={classes.cardContent}>
              <Grid container>
                {isHoliday && (
                  <HolidayBanner holiday={holiday} classes={classes} />
                )}
                {todayPresences.filter(({ spot: m }) => m).length === 0 && !isHoliday && (
                  <NoPresenceMessage classes={classes} />
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
};

export default React.memo(DayCard);
