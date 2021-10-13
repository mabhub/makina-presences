import React from 'react';
// import createPersistedState from 'use-persisted-state';

import { Grid } from '@material-ui/core';
import { makeStyles, alpha } from '@material-ui/core/styles';

// import { sameLowC } from '../helpers';
// import PresenceContext from './PresenceContext';
import TriPresence from './TriPresence';

// const useTriState = createPersistedState('tri');

const useStyles = makeStyles(theme => ({
  moment: {
    color: theme.palette.grey[500],
  },
  matin: {
    background: alpha(theme.palette.primary.main, 0.15),
  },
  midi: {},
  aprem: {
    background: alpha(theme.palette.primary.main, 0.15),
  },
  addMoment: {
    fontSize: '0.5rem',
    '& .MuiSvgIcon-root': {
      width: '0.7em',
      height: '0.7em',
    },
    '&[disabled]': {
      opacity: 0.2,
    },
  },
  tri: {
    margin: theme.spacing(0.25),
    height: theme.spacing(2.5),
    '& .MuiChip-label': {
      padding: theme.spacing(0, 0.65, 0, 0.75),
    },
    '& .MuiChip-deleteIcon': {
      marginRight: theme.spacing(0.2),
    },
  },
}));

const Moment = ({
  // moment,
  // day,
  momentPresences: presences = [],
  // userPresence,
}) => {
  const classes = useStyles();
  // const [tri] = useTriState('');

  // const TRI = 'tri';

  // const showAdd = !presences.some(({ [TRI]: t }) => sameLowC(t, tri));
  // const canAdd = showAdd && tri.length > 2;

  // const setPresence = React.useContext(PresenceContext);

  // const onAdd = React.useCallback(
  //   () => setPresence({ tri, date: day, changes: { [moment]: true }, userPresence }),
  //   [day, moment, setPresence, tri, userPresence],
  // );

  // const onDelete = React.useCallback(
  //   () => setPresence({ tri, date: day, changes: { [moment]: false }, userPresence }),
  //   [day, moment, setPresence, tri, userPresence],
  // );

  return (
    <Grid
      item
      xs={12}
      className={classes.moment}
    >
      {presences
        .sort(({ tri: a }, { tri: b }) => (a.localeCompare(b)))
        .map(({ id, tri: t, fake }) => (
          <TriPresence
            key={id}
            tri={t}
            alt={fake}
            // onDelete={onDelete}
            className={classes.tri}
          />
        ))}
    </Grid>
  );
};

const MemoizedMoment = React.memo(Moment, (prev, next) =>
  JSON.stringify(prev.momentPresences) === JSON.stringify(next.momentPresences)
  && JSON.stringify(prev.userPresence) === JSON.stringify(next.userPresence));

export default MemoizedMoment;
