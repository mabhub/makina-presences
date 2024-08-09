import React, { useEffect } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { alpha, Box, lighten } from '@mui/material';
import clsx from 'clsx';
import createPersistedState from 'use-persisted-state';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { sameLowC } from '../helpers';
import usePresences from '../hooks/usePresences';

const useTriState = createPersistedState('tri');

const useStyles = makeStyles(theme => ({
  bottom: {
    position: 'absolute',
    bottom: '0',
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

  disabled: {
    backgroundColor: 'transparent',
    color: theme.palette.primary.fg,
    opacity: 0.6,
  },
}));

const SpotButtonAfternoon = ({ presences, onConflict, spot, disabled }) => {
  const classes = useStyles();
  const [tri] = useTriState('');
  const { place } = useParams();
  const { deletePresence } = usePresences(place);

  const { Identifiant: spotId } = spot;

  const [presence, ...rest] = presences;

  const isConflict = Boolean(rest.length);
  const isOccupied = Boolean(presence);
  const isOwnSpot = Boolean(sameLowC(presence?.tri, tri));

  useEffect(() => {
    if (isConflict) {
      onConflict(
        isConflict,
        presences.find(({ tri: t }) => tri !== t).tri,
        spotId,
      );
      deletePresence({ id: presences.find(({ tri: t }) => t === tri).id });
    }
  }, [isConflict]);

  return (
    <Box
      className={clsx({
        [classes.bottom]: true,
        [classes.ownSpot]: isOwnSpot,
        [classes.occupied]: isOccupied,
        [classes.conflict]: isConflict,
        [classes.disabled]: disabled,
        [`hl-${presence?.tri}`]: presence?.tri && !disabled,
      })}
    >
      {presence?.tri}
    </Box>
  );
};

export default React.memo(SpotButtonAfternoon);
