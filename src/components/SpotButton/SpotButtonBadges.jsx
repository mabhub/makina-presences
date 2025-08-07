/**
 * Component for displaying spot badges and indicators
 * Handles conflict badges and other visual indicators
 */

import React from 'react';
import { Tooltip } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(theme => ({
  badge: {
    position: 'absolute',
    color: theme.palette.error.main,
    background: theme.palette.primary.bg,
    borderRadius: 99,
    zIndex: 1,
    transform: 'translate(10%, -100%)',
  },
}));

/**
 * SpotButtonBadges component
 * @param {Object} props - Component props
 * @param {boolean} props.isConflict - Whether there's a conflict
 * @param {Array} props.mornings - Morning presences
 * @param {Array} props.afternoons - Afternoon presences
 * @param {number} props.x - X position
 * @param {number} props.y - Y position
 * @returns {JSX.Element|null} Badge component or null
 */
const SpotButtonBadges = ({
  isConflict,
  mornings,
  afternoons,
  x,
  y,
}) => {
  const classes = useStyles();

  const shouldShowBadge = isConflict
    || Boolean(afternoons.length > 1)
    || Boolean(mornings.length > 1);

  if (!shouldShowBadge) {
    return null;
  }

  return (
    <Tooltip
      title="Plusieurs personnes sont inscrites sur ce poste"
      placement="right"
    >
      <ErrorOutline
        className={classes.badge}
        style={{
          left: `${x}px`,
          top: `${y}px`,
        }}
      />
    </Tooltip>
  );
};

export default React.memo(SpotButtonBadges);
