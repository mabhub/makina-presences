import React from 'react';

import { Grid } from '@mui/material';
import { alpha } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';

import { useParams } from 'react-router-dom';
import useSpots from '../hooks/useSpots';
import TriPresence from './TriPresence';
import { deduplicate } from '../helpers';

const useStyles = makeStyles(theme => ({
  moment: {
    color: theme.palette.grey[500],
    display: 'flex',
    flexWrap: 'wrap',
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

  return (
    <Grid
      item
      xs={12}
      className={classes.moment}
    >
      {deduplicate(presences, 'tri', (a, b) => !isCumulativeSpot(b.spot) - !isCumulativeSpot(a.spot))
        .sort(({ tri: a }, { tri: b }) => (a.localeCompare(b)))
        .map(({ id, spot, tri: t, fake, period }) => (
          <TriPresence
            key={id}
            tri={t}
            alt={fake}
            className={classes.tri}
            period={period}
            isParking={isCumulativeSpot(spot)}
          />
        ))}
    </Grid>
  );
};

const MemoizedMoment = React.memo(Moment, (prev, next) =>
  JSON.stringify(prev.momentPresences) === JSON.stringify(next.momentPresences)
  && JSON.stringify(prev.userPresence) === JSON.stringify(next.userPresence));

export default MemoizedMoment;
