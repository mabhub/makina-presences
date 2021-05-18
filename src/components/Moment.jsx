import React from 'react';
import clsx from 'clsx';
import createPersistedState from 'use-persisted-state';

import { Chip, Grid, IconButton, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';

import { SubscribeIcon, UnsubscribeIcon } from './SubscriptionIcon';
import { fieldLabel, fieldMap, placesId, tooltipOptions } from '../settings';
import { sameLowC } from '../helpers';

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
  setPresence,
  day,
  momentPresences: presences = [],
  userPresence,
}) => {
  const classes = useStyles();
  const [tri, setTri] = useTriState('');
  const [place] = usePlaceState(validPlaces[0]);

  const { TRI } = fieldMap[place];

  const showAdd = !presences.some(({ [TRI]: t }) => sameLowC(t, tri));
  const canAdd = showAdd && tri.length > 2;

  const onAdd = () => setPresence({ tri, date: day, changes: { [moment]: true }, userPresence });
  const onDelete = () =>
    setPresence({ tri, date: day, changes: { [moment]: false }, userPresence });

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
        .map(({ id, [TRI]: t, fake }) => {
          const color = fake ? 'secondary' : 'primary';
          const currentTri = sameLowC(t, tri);

          return (
            <Tooltip
              {...tooltipOptions}
              title={currentTri ? '' : 'Utiliser ce trigramme'}
              key={id}
            >
              <Chip
                size="small"
                label={t}
                color={currentTri ? color : undefined}
                className={classes.tri}
                onClick={!currentTri ? () => setTri(t) : undefined}
                deleteIcon={(
                  <UnsubscribeIcon
                    outline={false}
                    when={label}
                  />
                )}
                onDelete={sameLowC(t, tri) ? onDelete : undefined}
              />
            </Tooltip>
          );
        })}

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
