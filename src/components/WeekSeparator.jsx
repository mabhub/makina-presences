import React from 'react';
import clsx from 'clsx';
import { Divider } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(theme => {
  const maxWidth = mq => `@media (max-width: ${theme.breakpoints.values[mq]}px)`;
  return {
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
  };
});

/**
 * WeekSeparator component: Displays a divider with week number.
 *
 * @param {Object} props - Component props.
 * @param {number} props.weekIndex - ISO week number.
 * @param {boolean} props.isFirstWeek - True if this is the first week displayed.
 * @returns {JSX.Element} The rendered week separator.
 */
const WeekSeparator = ({ weekIndex, isFirstWeek }) => {
  const classes = useStyles();

  return (
    <Divider
      className={clsx({
        [classes.weekSeparator]: true,
        [classes.firstWeek]: isFirstWeek,
      })}
      textAlign="right"
    >
      <span className={classes.weekTextSeparator}>{`Semaine ${weekIndex}`}</span>
    </Divider>
  );
};

export default React.memo(WeekSeparator);
