import React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { GitHub } from '@mui/icons-material';
import { Box, Container, Grid, Link, Tab, Tabs } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import createPersistedState from 'use-persisted-state';

import PresenceForm from './PresenceForm';

import usePlans from '../hooks/usePlans';
import Legend from './Legend';
import LoadIndicator from './LoadIndicator';
import Plan from './Plan';
import PresenceCalendar from './PresenceCalendar';
import UserMenu from './UserMenu';

import { name, repository, version } from '../../package.json';

const { VITE_PROJECT_VERSION = version } = import.meta.env;

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(dayOfYear);

const useTriState = createPersistedState('tri');
const useMaxWidthState = createPersistedState('useMaxWidth');
const useStyles = makeStyles(theme => {
  const maxWidth = mq => `@media (max-width: ${theme.breakpoints.values[mq]}px)`;

  return {
    notice: {
      marginTop: theme.spacing(4),
    },
    container: {},

    wrapper: {
      height: '100dvh',
      display: 'grid',
      gridTemplateAreas: `
        "a a a"
        "b c c"
        "b c c"`,
      gridTemplateColumns: '300px 3fr',
      gridTemplateRows: 'auto 1fr',
      [maxWidth('sm')]: {
        gridTemplateAreas: `
          "a"
          "c"
          "b"`,
        gridTemplateColumns: 'auto',
        gridTemplateRows: 'auto 1fr 1fr',
      },
    },
    top: {
      gridArea: 'a',
      borderBottom: `1px solid ${theme.palette.primary.main}`,
    },
    about: {
      flex: '0 0 auto',
      padding: theme.spacing(0, 1),
    },
    sourceLink: {
      display: 'inline-block',
      '& svg': {
        verticalAlign: 'middle',
      },
    },
    tabs: {
      minHeight: 0,
      position: 'relative',
    },
    tab: {
      textTransform: 'none',
      minHeight: 0,
    },
    userMenu: {
      flex: '0 0 auto',
      textAlign: 'right',
    },
    calendar: {
      gridArea: 'b',
      scrollbarWidth: 'thin',
      colorScheme: theme.palette.mode,
      overflow: 'auto',
      padding: theme.spacing(0, 0.25),
      position: 'relative',
      [maxWidth('sm')]: {
        boxShadow: '0px -30px 30px #0000000d',
        borderTopRightRadius: '30px',
        borderTopLeftRadius: '30px',
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        background: theme.palette.primary.elevated,
        marginTop: '-30px',
        zIndex: '2',
        '&::before': {
          position: 'sticky',
          top: 0,
          left: 0,
          zIndex: '2',
          content: '""',
          width: '100%',
          height: '30px',
          background: theme.palette.primary.elevated,
        },
      },
    },
    plan: {
      gridArea: 'c',
      overflow: 'hidden',
      position: 'relative',
    },
  };
});

const draftStyle = {
  position: 'absolute',
  visibility: 'hidden',
};

const stripeColor = theme => (theme.palette.mode === 'light' ? '#f8f8f8' : '#363535');

const selectedDraftStyle = {
  backgroundImage: theme => `linear-gradient(45deg, transparent 25%, ${stripeColor(theme)} 25%, ${stripeColor(theme)} 50%, transparent 50%, transparent 75%, ${stripeColor(theme)} 75%, ${stripeColor(theme)} 100%)`,
  backgroundSize: '12px 12px',
  '&:after': {
    content: '"Inactif"',
    position: 'absolute',
    right: 1,
    top: 1,
    color: theme => theme.palette.error.main,
    background: theme => theme.palette.primary.bg,
    border: theme => `2px solid ${theme.palette.error.main}`,
    padding: '3px 10px',
    borderRadius: '10px',
    fontSize: '0.75rem',
    zIndex: 1,
    transform: 'scale(0.7)',
    transformOrigin: 'top right',
  },
};

const PresencePage = () => {
  const classes = useStyles();
  const [tri] = useTriState('');
  const plans = usePlans();
  const { place, day } = useParams();
  const history = useHistory();

  const isTriValid = tri?.length >= 3;

  const [useMaxWidth] = useMaxWidthState();

  const handlePlaceChange = (event, newPlace) => {
    const path = ['', newPlace || place];
    if (day) { path.push(day); }
    history.push(path.join('/'));
  };

  const getDraftTabStyle = placeName => {
    if (placeName === place) {
      return selectedDraftStyle;
    }
    return draftStyle;
  };

  return (
    <div className="PresencePage">
      <LoadIndicator />

      {/* === TO ADD AFTER UPGRADING TO REACT 18 === */}
      {/* <Toaster
        richColors
        visibleToasts={7}
      /> */}

      {(!isTriValid || !place) && (
        <PresenceForm />
      )}

      {(isTriValid && place) && (
        <Container className={classes.container} disableGutters maxWidth={useMaxWidth ? 'unset' : 'lg'}>
          <Box
            spacing={2}
            className={classes.wrapper}
          >
            <Box className={classes.top}>
              <Grid container alignItems="center">
                <Grid item xs={1} className={classes.about}>
                  <Link
                    href={repository}
                    className={classes.sourceLink}
                    title={`${name} version ${VITE_PROJECT_VERSION}`}
                  >
                    <GitHub />
                  </Link>
                </Grid>
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
                  {plans
                    .map(({ Name, Brouillon }) => (
                      <Tab
                        key={Name}
                        value={Name}
                        label={Name}
                        className={classes.tab}
                        sx={Brouillon ? getDraftTabStyle(Name) : {}}
                      />
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
      )}
    </div>
  );
};

export default PresencePage;
