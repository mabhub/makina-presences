import React from 'react';
import { CardContent, Collapse, Grid } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import HolidayBanner from './HolidayBanner';
import NoPresenceMessage from './NoPresenceMessage';
import Moment from './Moment';

const useStyles = makeStyles(theme => ({
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

/**
 * DayCardContent component: Renders the collapsible content of a day card.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.showCard - Whether to show the card content.
 * @param {boolean} props.isHoliday - True if the day is a holiday.
 * @param {Object} props.holiday - Holiday information object.
 * @param {Array} props.todayPresences - List of presences for this day.
 * @param {Object} props.currentTodayPresences - Current user's presence for this day.
 * @returns {JSX.Element} The rendered day card content.
 */
const DayCardContent = ({
  showCard,
  isHoliday,
  holiday,
  todayPresences,
  currentTodayPresences,
}) => {
  const classes = useStyles();

  // Filter presences with valid spots
  const presencesWithSpots = todayPresences.filter(({ spot: m }) => m);

  return (
    <Collapse in={showCard}>
      <CardContent className={classes.cardContent}>
        <Grid container>
          {isHoliday && (
            <HolidayBanner holiday={holiday} classes={classes} />
          )}
          {presencesWithSpots.length === 0 && !isHoliday && (
            <NoPresenceMessage classes={classes} />
          )}
          {!isHoliday && (
            <Moment
              momentPresences={presencesWithSpots}
              userPresence={currentTodayPresences}
            />
          )}
        </Grid>
      </CardContent>
    </Collapse>
  );
};

export default React.memo(DayCardContent);
