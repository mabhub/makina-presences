import React from 'react';
import clsx from 'clsx';
import createPersistedState from 'use-persisted-state';

import { Grid, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';

import { SubscribeIcon } from './SubscriptionIcon';
import { fieldLabel, fieldMap, placesId } from '../settings';
import { sameLowC } from '../helpers';
import PresenceContext from './PresenceContext';
import TriPresence from './TriPresence';

const useTriState = createPersistedState('tri');
const usePlaceState = createPersistedState('place');

const useStyles = makeStyles(theme => ({
  moment: {
    color: theme.palette.grey[500],
  },
  matin: {
    background: fade(theme.palette.primary.main, 0.15),
  },
  midi: {},
  aprem: {
    background: fade(theme.palette.primary.main, 0.15),
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

const validPlaces = Object.keys(placesId);

const Moment = ({
  moment,
  day,
  momentPresences: presences = [],
  userPresence,
}) => {
  const classes = useStyles();
  const [tri] = useTriState('');
  const [place] = usePlaceState(validPlaces[0]);

  const { TRI } = fieldMap[place];

  const showAdd = !presences.some(({ [TRI]: t }) => sameLowC(t, tri));
  const canAdd = showAdd && tri.length > 2;

  const setPresence = React.useContext(PresenceContext);

  const onAdd = React.useCallback(
    () => setPresence({ tri, date: day, changes: { [moment]: true }, userPresence }),
    [day, moment, setPresence, tri, userPresence],
  );

  const onDelete = React.useCallback(
    () => setPresence({ tri, date: day, changes: { [moment]: false }, userPresence }),
    [day, moment, setPresence, tri, userPresence],
  );

  const label = fieldLabel[place][moment];

  return (
    <Grid
      item
      xs={4}
      className={clsx(classes.moment, classes[label])}
    >
      {label}<br />

      {presences
        .sort(({ [TRI]: a }, { [TRI]: b }) => (a.localeCompare(b)))
        .map(({ id, [TRI]: t, fake }) => (
          <TriPresence
            key={id}
            tri={t}
            momentLabel={label}
            alt={fake}
            onDelete={onDelete}
            className={classes.tri}
          />
        ))}

      <IconButton
        onClick={onAdd}
        className={classes.addMoment}
        size="small"
        disabled={!canAdd}
      >
        <SubscribeIcon
          when={label}
        />
      </IconButton>
    </Grid>
  );
};

const MemoizedMoment = React.memo(Moment, (prev, next) =>
  JSON.stringify(prev.momentPresences) === JSON.stringify(next.momentPresences)
  && JSON.stringify(prev.userPresence) === JSON.stringify(next.userPresence));

export default MemoizedMoment;
