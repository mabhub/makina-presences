import React from 'react';

import createPersistedState from 'use-persisted-state';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import { Container, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import usePresences from '../hooks/usePresences';

import PresenceForm from './PresenceForm';
// import Footer from './Footer';

// import InitialNotice from './InitialNotice';
import Plan from './Plan';
import PresenceContext from './PresenceContext';
import LoadIndicator from './LoadIndicator';
import PresenceCalendar from './PresenceCalendar';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(dayOfYear);

const useTriState = createPersistedState('tri');
const usePlaceState = createPersistedState('place');

const useStyles = makeStyles(theme => ({
  notice: {
    marginTop: theme.spacing(4),
  },
  container: {},
  gridContainer: {
    height: '100vh',
  },
}));

const PresencePage = () => {
  const classes = useStyles();
  const [tri] = useTriState('');
  const [place] = usePlaceState('Toulouse');

  const isTriValid = tri.length >= 3;

  const { setPresence } = usePresences(place);

  return (
    <div className="PresencePage">
      <LoadIndicator />

      {(!isTriValid || !place) && (
        <PresenceForm />
      )}

      {(isTriValid && place) && (
        <PresenceContext.Provider value={setPresence}>
          <Container className={classes.container}>
            <Grid container spacing={2} className={classes.gridContainer}>
              <Grid item xs={3} style={{ overflow: 'auto', height: '100%' }}>
                <PresenceCalendar />
              </Grid>

              <Grid item xs={9} style={{ height: '100%' }}>
                <Plan />
              </Grid>
            </Grid>
          </Container>
        </PresenceContext.Provider>
      )}
    </div>
  );
};

export default PresencePage;
