import { alpha, Box, lighten } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { useEffect } from 'react';
import createPersistedState from 'use-persisted-state';
import { sameLowC } from '../helpers';

const useTriState = createPersistedState('tri');

const useStyles = makeStyles(theme => ({
  top: {
    top: 0,
  },
  bottom: {
    bottom: 0,
  },

  base: {
    position: 'absolute',
    width: '100%',
    height: '50%',
    color: theme.palette.primary.fg,
    border: 'none',
    textTransform: 'none',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    fontSize: '0.75em',
    padding: theme.spacing(0),
    display: 'flex',
    justifyContent: 'center',
    transition: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  occupied: {
    backgroundColor: alpha(theme.palette.primary.main, 0.25),
    color: lighten(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.75 : 0),
    boxShadow: 'none',
  },

  ownSpot: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  ownSpotPending: {
    backgroundColor: theme.palette.secondary.main,
  },

  disabled: {
    backgroundColor: 'transparent',
    color: theme.palette.primary.fg,
    opacity: 0.6,
  },
}));

function SpotButtonHaldDay ({ presences, onConflict, disabled, position }) {
  const classes = useStyles();
  const [ownTri] = useTriState('');

  const [presence, ...rest] = presences;

  const isConflict = Boolean(rest.length);
  const isOccupied = Boolean(presence);
  const isOwnSpot = presences.some(({ tri }) => sameLowC(ownTri, tri));

  useEffect(() => {
    if (isConflict && rest.some(({ tri }) => sameLowC(ownTri, tri))) {
      onConflict(isConflict,
        presences.find(({ tri: t }) => ownTri !== t).tri);
    } else {
      onConflict(false);
    }
  }, [isConflict]);

  return (
    <Box
      className={clsx({
        [classes.top]: position === 'top',
        [classes.bottom]: position === 'bottom',
        [classes.base]: true,
        [classes.ownSpot]: isOwnSpot,
        [classes.ownSpotPending]: isOwnSpot && presence?.fake,
        [classes.occupied]: isOccupied,
        [classes.disabled]: disabled,
        [`hl-${presence?.tri}`]: presence?.tri && !disabled,
      })}
    >
      {(!isConflict && presence?.tri)
        || (isConflict && (presences
          .some(({ tri }) => sameLowC(ownTri, tri))
          ? presences.find(({ tri }) => sameLowC(ownTri, tri)).tri
          : presence.tri))}
    </Box>
  );
}

export default React.memo(SpotButtonHaldDay);
