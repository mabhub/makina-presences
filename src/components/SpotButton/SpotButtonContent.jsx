/**
 * Component for rendering spot button content
 * Handles conditional display of full day vs half-day presences
 */

import React from 'react';
import { Grid, Divider } from '@mui/material';
import { sameLowC } from '../../helpers';
import { AFTERNOON_PERIOD, MORNING_PERIOD } from '../../constants/periods';
import SpotButtonHalfDay from '../SpotButtonHalfDay';

/**
 * SpotButtonContent component
 * @param {Object} props - Component props
 * @param {Array} props.mornings - Morning presences
 * @param {Array} props.afternoons - Afternoon presences
 * @param {Array} props.fullDays - Full day presences
 * @param {Object} props.presenceFullDay - First full day presence
 * @param {boolean} props.isConflict - Whether there's a conflict
 * @param {boolean} props.edit - Whether in edit mode
 * @param {string} props.ownTri - User's trigram
 * @param {string} props.spotId - Spot identifier
 * @param {Function} props.handleConflict - Conflict handler
 * @param {boolean} props.isPast - Whether the day is in the past
 * @param {boolean} props.isHover - Whether button is hovered
 * @param {string} props.triPeriod - User's current period
 * @param {string} props.borderColor - Border color
 * @returns {JSX.Element} Content component
 */
const SpotButtonContent = ({
  mornings,
  afternoons,
  fullDays,
  presenceFullDay,
  isConflict,
  edit,
  ownTri,
  spotId,
  handleConflict,
  isPast,
  isHover,
  triPeriod,
  borderColor,
}) => {
  // Display full day content if no half-day presences
  if (afternoons.length === 0 && mornings.length === 0) {
    return (
      (!edit && !isConflict && presenceFullDay?.tri)
        || (isConflict && (fullDays
          .some(({ tri }) => sameLowC(ownTri, tri))
          ? fullDays.find(({ tri }) => sameLowC(ownTri, tri)).tri
          : presenceFullDay.tri)
        )
        || spotId
    );
  }

  // Display half-day content
  return (
    <Grid container>
      {['left', 'right'].map((position, index) => (
        <React.Fragment key={position}>
          <SpotButtonHalfDay
            presences={position === 'left' ? mornings : afternoons}
            onConflict={handleConflict}
            disabled={isPast}
            position={position}
            isShared={Boolean(mornings.length) && Boolean(afternoons.length)}
            isHover={isHover}
            suggestOtherHalf={
              position === 'left'
                ? mornings.length === 0 && triPeriod !== AFTERNOON_PERIOD
                : afternoons.length === 0 && triPeriod !== MORNING_PERIOD
            }
            borderColor={borderColor}
          />
          {index === 0 && (
            <Divider
              sx={{
                width: '105%',
                zIndex: 1,
                borderColor,
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%) rotate(90deg)',
              }}
            />
          )}
        </React.Fragment>
      ))}
    </Grid>
  );
};

export default React.memo(SpotButtonContent);
