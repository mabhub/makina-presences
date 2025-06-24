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
import { sameLowC, displayCard } from '../helpers';
import DayHeader from './DayHeader';
import Moment from './Moment';

/**
 * DayCard component: displays a single day in the calendar.
 *
 * @param {Object} props - Component props.
 * @param {string} props.isoDate - ISO date string (YYYY-MM-DD).
 * @param {number} props.weekIndex - Week number.
 * @param {number} props.weekDayIndex - Day index in the week (0=Sunday).
 * @param {boolean} props.isPast - True if the day is in the past.
 * @param {number} props.index - Index in the grid.
 * @param {Array<string>} props.dayPrefs - Array of favorite day labels.
 * @param {string} props.tri - Current tri value.
 * @param {Array<Object>} props.cumulativeSpot - Array of cumulative spots.
 * @param {Object} props.holidays - Holidays object (isoDate -> label).
 * @param {Array<Object>} props.presences - Array of presences.
 * @param {string} props.day - Selected day (ISO format).
 * @param {boolean} props.showPastDays - Show past days preference.
 * @param {Object} props.today - dayjs object for today.
 * @param {Object} props.history - React Router history.
 * @param {string} props.place - Place identifier.
 * @param {Object} props.classes - JSS classes.
 * @param {Array<string>} props.days - Array of day labels.
 * @returns {JSX.Element|null}
 */
const DayCard = ({
  isoDate,
  weekIndex,
  weekDayIndex,
  isPast,
  index,
  dayPrefs,
  tri,
  cumulativeSpot,
  holidays,
  presences,
  day,
  showPastDays,
  today,
  history,
  place,
  classes,
  days,
}) => {
  // Technical: skip rendering for Saturday (6) and Sunday (0)
  if (weekDayIndex === 6 || weekDayIndex === 0) {
    return <React.Fragment key={isoDate} />;
  }

  const dayLabel = days[weekDayIndex];
  const dayIsFavorite = dayPrefs.some(d => d === dayLabel);

  const holiday = holidays[isoDate];
  const isHoliday = Boolean(holiday);

  // Technical: filter presences for the current day
  const todayPresences = presences.filter(({ day: d }) => d === isoDate);

  // Technical: find the current user's presence (not cumulative)
  const currentTodayPresences = todayPresences
    .filter(({ spot }) => !cumulativeSpot
      .map(({ Identifiant }) => Identifiant).includes(spot))
    .find(({ tri: t }) => sameLowC(t, tri));

  const isToday = isoDate === today.format('YYYY-MM-DD');
  const newWeek = Boolean(weekDayIndex === 1);

  // Technical: determine if the card should be displayed
  const showCard = displayCard({
    isPast,
    isHoliday,
    isoDate,
    dayIsFavorite,
    selectedDay: day,
    showPastDays,
  });

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
                  <Grid item xs={12} className={classes.holiday}>
                    Jour férié<br />
                    ({holiday})
                  </Grid>
                )}
                {todayPresences.filter(({ spot: m }) => m).length === 0 && !isHoliday && (
                  <Grid item sx={{ textAlign: 'center', width: '100%', opacity: '.5' }}>
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
};

export default React.memo(DayCard);
