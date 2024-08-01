import { useHistory, useParams } from 'react-router-dom';

import createPersistedState from 'use-persisted-state';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import { Box, Container, Grid, Tabs, Tab, Link } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { GitHub } from '@mui/icons-material';

import PresenceForm from './PresenceForm';

import Plan from './Plan';
import LoadIndicator from './LoadIndicator';
import PresenceCalendar from './PresenceCalendar';
import usePlans from '../hooks/usePlans';
import UserMenu from './UserMenu';
import Legend from './Legend';

import { name, version, repository } from '../../package.json';

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

const draftStyle = {
  position: 'absolute',
  visibility: 'hidden',
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

  return (
    <div className="PresencePage">
      <LoadIndicator />

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
                        sx={Brouillon ? draftStyle : {}}
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
