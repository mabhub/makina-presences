import React from 'react';

import createPersistedState from 'use-persisted-state';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import { Box, Container, Grid, Tabs, Tab } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import usePresences from '../hooks/usePresences';

import PresenceForm from './PresenceForm';

import Plan from './Plan';
import PresenceContext from './PresenceContext';
import LoadIndicator from './LoadIndicator';
import PresenceCalendar from './PresenceCalendar';
import usePlans from '../hooks/usePlans';
import UserMenu from './UserMenu';
import Legend from './Legend';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(dayOfYear);

const useTriState = createPersistedState('tri');
const usePlaceState = createPersistedState('place');
const useStyles = makeStyles(theme => {
  const maxWidth = mq => `@media (max-width: ${theme.breakpoints.values[mq]}px)`;

  return {
    notice: {
      marginTop: theme.spacing(4),
    },
    container: {},

    wrapper: {
      height: '100vh',
      display: 'grid',
      gridTemplateAreas: `
        "a a a"
        "b c c"
        "b c c"`,
      gridTemplateColumns: '1fr 3fr',
      gridTemplateRows: 'auto 1fr',
      [maxWidth('sm')]: {
        gridTemplateAreas: `
          "a"
          "b"
          "c"`,
        gridTemplateColumns: 'auto',
        gridTemplateRows: 'auto 1fr 1fr',
      },
    },
    top: {
      gridArea: 'a',
      borderBottom: `1px solid ${theme.palette.primary.main}`,
    },
    tabs: {
      minHeight: 0,
    },
    tab: {
      textTransform: 'none',
      minHeight: 0,
    },
    userMenu: {
      textAlign: 'right',
    },
    calendar: {
      gridArea: 'b',
      overflow: 'auto',
      padding: theme.spacing(0, 0.25),
    },
    plan: {
      gridArea: 'c',
      overflow: 'hidden',
      position: 'relative',
    },
  };
});

const PresencePage = () => {
  const classes = useStyles();
  const [tri] = useTriState('');
  const [place, setPlace] = usePlaceState('Toulouse');
  const plans = usePlans();

  const isTriValid = tri?.length >= 3;

  const { setPresence } = usePresences(place);

  const handlePlaceChange = (event, newPlace) => {
    setPlace(prevPlace => (newPlace || prevPlace));
  };

  return (
    <div className="PresencePage">
      <LoadIndicator />

      {(!isTriValid || !place) && (
        <PresenceForm />
      )}

      {(isTriValid && place) && (
        <PresenceContext.Provider value={setPresence}>
          <Container className={classes.container} disableGutters>
            <Box
              spacing={2}
              className={classes.wrapper}
            >
              <Box className={classes.top}>
                <Grid container alignItems="center">
                  <Tabs
                    component={Grid}
                    item
                    xs
                    value={place}
                    onChange={handlePlaceChange}
                    centered
                    className={classes.tabs}
                    indicatorColor="primary"
                    textColor="primary"
                  >
                    {plans.map(({ Name }) => (
                      <Tab key={Name} value={Name} label={Name} className={classes.tab} />
                    ))}
                  </Tabs>

                  <Grid item xs={2} className={classes.userMenu}>
                    <UserMenu />
                  </Grid>
                </Grid>
              </Box>

              <Grid container className={classes.calendar}>
                <PresenceCalendar />
              </Grid>

              <Box className={classes.plan}>
                <Legend />
                <Plan />
              </Box>
            </Box>
          </Container>
        </PresenceContext.Provider>
      )}
    </div>
  );
};

export default PresencePage;
