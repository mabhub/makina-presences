import React from 'react';

import { Grid } from '@mui/material';
import { alpha } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';

import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import useSpots from '../hooks/useSpots';
import TriPresence from './TriPresence';

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
  momentPresences: presences = [],
}) => {
  const classes = useStyles();
  const { place } = useParams();

  const spots = useSpots(place);
  const cumulativeSpots = spots.filter(({ Cumul }) => Cumul);
  const isCumulativeSpot = React.useCallback(
    identifiant => cumulativeSpots.map(({ Identifiant }) => Identifiant).includes(identifiant),
    [cumulativeSpots],
  );

  const deduplicate = (collection, key) =>
    collection
      .sort(({ spot: a }, { spot: b }) => !isCumulativeSpot(b) - !isCumulativeSpot(a))
      .reduce((acc, curr) => {
        const { values = new Set(), store = [] } = acc;

        if (values.has(curr[key])) {
          return acc;
        }

        return {
          values: new Set([...values, curr[key]]),
          store: [...store, curr],
        };
      }, {}).store || [];

  return (
    <Grid
      item
      xs={12}
      className={classes.moment}
    >
      {deduplicate(presences, 'tri')
        .sort(({ tri: a }, { tri: b }) => (a.localeCompare(b)))
        .map(({ id, tri: t, fake, period }) => (
          <TriPresence
            key={id}
            tri={t}
            alt={fake}
            className={classes.tri}
            period={period}
          />
        ))}
    </Grid>
  );
};

const MemoizedMoment = React.memo(Moment, (prev, next) =>
  JSON.stringify(prev.momentPresences) === JSON.stringify(next.momentPresences)
  && JSON.stringify(prev.userPresence) === JSON.stringify(next.userPresence));

export default MemoizedMoment;
