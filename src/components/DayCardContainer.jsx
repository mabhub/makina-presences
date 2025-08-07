import React from 'react';
import clsx from 'clsx';
import { Card, CardActionArea } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import DayHeader from './DayHeader';
import DayCardContent from './DayCardContent';

const useStyles = makeStyles(theme => ({
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
  holidayCard: {
    opacity: 0.85,
  },
  past: {
    opacity: 0.40,
  },
}));

/**
 * DayCardContainer component: Renders the card structure with header and content.
 *
 * @param {Object} props - Component props.
 * @param {string} props.isoDate - ISO date string (YYYY-MM-DD) for the day.
 * @param {boolean} props.isToday - True if this is today's date.
 * @param {boolean} props.isPast - True if the day is in the past.
 * @param {boolean} props.isHoliday - True if the day is a holiday.
 * @param {Object} props.holiday - Holiday information object.
 * @param {Array} props.todayPresences - List of presences for this day.
 * @param {Object} props.currentTodayPresences - Current user's presence for this day.
 * @param {string} props.tri - Current user's trigramme.
 * @param {string} props.place - Current place name.
 * @param {boolean} props.showCard - Whether to show the card content.
 * @param {Array} props.cumulativeSpot - List of cumulative spots (parking).
 * @returns {JSX.Element} The rendered day card container.
 */
const DayCardContainer = ({
  isoDate,
  isToday,
  isPast,
  isHoliday,
  holiday,
  todayPresences,
  currentTodayPresences,
  tri,
  place,
  showCard,
  cumulativeSpot,
}) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { day = dayjs().format('YYYY-MM-DD') } = useParams();

  return (
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
        onClick={() => navigate(`/${place}/${isoDate}`)}
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
        <DayCardContent
          showCard={showCard}
          isHoliday={isHoliday}
          holiday={holiday}
          todayPresences={todayPresences}
          currentTodayPresences={currentTodayPresences}
        />
      </CardActionArea>
    </Card>
  );
};

export default React.memo(DayCardContainer);
