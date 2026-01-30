import { useNavigate, useParams } from 'react-router-dom';

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

const {
  VITE_PROJECT_VERSION = version,
  VITE_SENTRY_PROJECT_URL,
} = import.meta.env;

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
      marginLeft: 'auto',
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
  const navigate = useNavigate();

  const isTriValid = tri?.length >= 3;

  const [useMaxWidth] = useMaxWidthState();

  const handlePlaceChange = (event, newPlace) => {
    const path = ['', newPlace || place];
    if (day) { path.push(day); }
    navigate(path.join('/'));
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

      {/* === TOASTER CAN BE ENABLED WITH REACT 19 === */}
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
                  {repository && (
                    <Link
                      href={repository}
                      className={classes.sourceLink}
                      title={`${name} version ${VITE_PROJECT_VERSION}`}
                    >
                      <GitHub />
                    </Link>
                  )}
                  {VITE_SENTRY_PROJECT_URL && (
                    <Link
                      href={VITE_SENTRY_PROJECT_URL}
                      className={classes.sourceLink}
                      title="Sentry - Error tracking"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 72 66">
                        <path fill="currentColor" d="M40 13.26a4.67 4.67 0 0 0-8 0l-6.58 11.27a32.21 32.21 0 0 1 17.75 26.66h-4.62a27.68 27.68 0 0 0-15.46-22.72L17 39a15.92 15.92 0 0 1 9.23 12.17H15.62a.76.76 0 0 1-.62-1.11l2.94-5a10.7 10.7 0 0 0-3.36-1.9l-2.91 5a4.54 4.54 0 0 0 1.69 6.24 4.66 4.66 0 0 0 2.26.6h14.53a19.4 19.4 0 0 0-8-17.31l2.31-4A23.87 23.87 0 0 1 34.76 55h12.31a35.88 35.88 0 0 0-16.41-31.8l4.67-8a.77.77 0 0 1 1.05-.27c.53.29 20.29 34.77 20.66 35.17a.76.76 0 0 1-.68 1.13H51.6q.09 1.91 0 3.81h4.78A4.59 4.59 0 0 0 61 50.43a4.5 4.5 0 0 0-.62-2.28Z" />
                      </svg>
                    </Link>
                  )}
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
