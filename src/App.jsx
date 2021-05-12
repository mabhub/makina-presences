import React from 'react';
import clsx from 'clsx';

import createPersistedState from 'use-persisted-state';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Grid,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import { fade, emphasize } from '@material-ui/core/styles/colorManipulator';
import { AddCircle, AddCircleOutline, RemoveCircle, RemoveCircleOutline } from '@material-ui/icons';

import usePresences from './hooks/usePresences';
import useHolidays from './hooks/useHolidays';

import { placesId, fieldLabel, fieldMap, Days, Months, tooltipOptions } from './settings';
import Header from './Header';
import Footer from './Footer';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

const useTriState = createPersistedState('tri');
const usePlaceState = createPersistedState('place');

const useStyles = makeStyles(theme => ({
  week: {
    textAlign: 'right',
    fontStyle: 'italic',
    fontSize: '0.8em',
    alignSelf: 'center',
  },
  holidayCard: {
    opacity: 0.85,
  },
  avatar: {
    background: theme.palette.grey[400],
  },
  holidayAvatar: {
    background: theme.palette.grey[200],
  },
  day: {
    display: 'flex',
  },
  dayCard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  today: {
    backgroundColor: emphasize(theme.palette.primary.main, 0.75),
  },
  cardHeader: {
    padding: theme.spacing(2, 2, 1),
  },
  cardContent: {
    flex: 1,
    display: 'flex',

    background: '#f5f5f5',
    textAlign: 'center',
    fontSize: theme.typography.pxToRem(10),
    padding: theme.spacing(1),
    '&:last-child': {
      paddingBottom: theme.spacing(1),
    },
  },
  holiday: {
    textAlign: 'center',
    fontSize: '1rem',
    fontStyle: 'italic',
    alignSelf: 'center',
  },
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
  currentTri: {
    fontWeight: 'bold',
  },
  addMoment: {
    fontSize: '0.5rem',
    '& .MuiSvgIcon-root': {
      width: '0.7em',
      height: '0.7em',
    },
  },
}));

const validPlaces = Object.keys(placesId);

function App () {
  const classes = useStyles();
  const [tri, setTri] = useTriState('');
  const [place, setPlace] = usePlaceState(validPlaces[0]);

  if (!validPlaces.includes(place)) {
    setPlace(validPlaces[0]);
  }

  const labels = fieldLabel[place];
  const { KEY, DATE, MATIN, MIDI, APREM, TRI } = fieldMap[place];
  const { presences, createRow, updateRow, deleteRow } = usePresences(place);

  const holidays = useHolidays();

  const dayAdd = (
    date,
    changes,
  ) => () => {
    const isoDate = date.format('YYYY-MM-DD');
    const existing = presences.find(({ [KEY]: key }) => (key === `${isoDate}-${tri}`));

    if (!changes) {
      if (existing) {
        if (!existing[MATIN] || !existing[MIDI] || !existing[APREM]) {
          return updateRow.mutate({ id: existing.id, [MATIN]: true, [MIDI]: true, [APREM]: true });
        }

        return deleteRow.mutate(existing);
      }

      return createRow.mutate({ [KEY]: `${isoDate}-${tri}`, [DATE]: isoDate, [TRI]: tri, [MATIN]: true, [MIDI]: true, [APREM]: true });
    }

    if (existing) {
      const temp = { ...existing, ...changes };
      if (!temp[MATIN] && !temp[MIDI] && !temp[APREM]) {
        return deleteRow.mutate(temp);
      }

      return updateRow.mutate({ id: existing.id, ...changes });
    }

    return createRow.mutate({ [KEY]: `${isoDate}-${tri}`, [DATE]: isoDate, [TRI]: tri, ...changes });
  };

  const today = dayjs();
  const days = [...Array(21)];

  return (
    <div className="App">
      <Header />

      {(!place || tri.length < 3) && (
        <Container style={{ marginTop: '1rem' }}>
          <Grid container justify="center">
            <Grid item xs={10}>
              <Alert severity="info">
                Choisir un lieu et saisir un trigramme pour pouvoir remplir les présences.
              </Alert>
            </Grid>
          </Grid>
        </Container>
      )}

      <Container style={{ marginTop: '2rem' }}>
        <Grid container spacing={2}>
          {(tri.length >= 3) && days.map((_, index) => {
            const currentDay = today.day(index);
            const dayIndex = currentDay.day();
            const isoDay = currentDay.format('YYYY-MM-DD');
            const holiday = holidays[isoDay];

            const dayname = Days[(index) % 7];
            const dayInitial = dayname[0].toUpperCase();

            const date = `${currentDay.date().toString()} ${Months[currentDay.month()]}`;

            if (dayIndex === 6) {
              return (
                <Grid
                  item
                  xs={12}
                  lg={1}
                  key={currentDay.toString()}
                />
              );
            }

            if (dayIndex === 0) {
              return (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={1}
                  key={currentDay.toString()}
                  className={classes.week}
                >
                  s<strong>{currentDay.day(1).isoWeek()}</strong>
                </Grid>
              );
            }

            const todayPresences = presences.filter(({ [DATE]: d }) => (d === isoDay));
            const currentTodayPresences = todayPresences.find(({ [TRI]: t }) => t === tri) || {};
            const dayLongPresence = currentTodayPresences[MATIN]
              && currentTodayPresences[MIDI]
              && currentTodayPresences[APREM];

            return (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={2}
                key={currentDay.toString()}
                className={classes.day}
              >
                <Card
                  className={clsx({
                    [classes.dayCard]: true,
                    [classes.holidayCard]: holiday,
                  })}
                >
                  <CardHeader
                    avatar={(
                      <Avatar
                        className={clsx(classes.avatar, { [classes.holidayAvatar]: holiday })}
                      >
                        {dayInitial}
                      </Avatar>
                    )}
                    title={dayname}
                    subheader={date}
                    action={(
                      <IconButton disabled={Boolean(holiday)} onClick={dayAdd(currentDay)}>
                        {dayLongPresence && (
                          <Tooltip
                            {...tooltipOptions}
                            title={(
                              <>
                                <strong>Se désinscrire</strong><br />
                                (journée entière)
                              </>
                            )}
                          >
                            <RemoveCircleOutline />
                          </Tooltip>
                        )}
                        {!dayLongPresence && (
                          <Tooltip
                            {...tooltipOptions}
                            title={(
                              <>
                                <strong>S'inscrire</strong><br />
                                (journée entière)
                              </>
                            )}
                          >
                            <AddCircleOutline />
                          </Tooltip>
                        )}
                      </IconButton>
                    )}
                    className={clsx(
                      classes.cardHeader,
                      { [classes.today]: today.isSame(currentDay) },
                    )}
                  />

                  <CardContent className={classes.cardContent}>
                    <Grid container spacing={2}>
                      {holiday && (
                        <Grid item xs={12} className={classes.holiday}>
                          Jour férié<br />
                          ({holiday})
                        </Grid>
                      )}

                      {!holiday && [MATIN, MIDI, APREM].map(moment => {
                        const isPresent = todayPresences.some(
                          ({ [moment]: m, [TRI]: t }) => (m && t === tri),
                        );

                        const removeMoment = dayAdd(currentDay, { [moment]: false });
                        const addMoment = dayAdd(currentDay, { [moment]: true });
                        const todayMomentPresences = todayPresences.filter(({ [moment]: m }) => m);

                        return (
                          <Grid
                            item
                            xs={4}
                            className={clsx(
                              classes.moment,
                              classes[labels[moment]],
                            )}
                            key={moment}
                          >
                            {labels[moment]}<br />

                            {todayMomentPresences
                              .map(({ id, [TRI]: t, fake }) => {
                                const color = fake ? 'secondary' : 'primary';
                                const currentTri = t === tri;

                                return (
                                  <Chip
                                    key={id}
                                    size="small"
                                    label={t}
                                    color={currentTri ? color : undefined}
                                    className={classes.tri}
                                    onClick={!currentTri ? () => setTri(t) : undefined}
                                    deleteIcon={(
                                      <Tooltip
                                        {...tooltipOptions}
                                        title={(
                                          <>
                                            <strong>Se désinscrire</strong><br />
                                            ({fieldLabel[place][moment]} uniquement)
                                          </>
                                        )}
                                      >
                                        <RemoveCircle />
                                      </Tooltip>
                                    )}
                                    onDelete={t === tri ? removeMoment : undefined}
                                  />
                                );
                              })}

                            {!isPresent && (
                              <IconButton
                                onClick={addMoment}
                                className={classes.addMoment}
                                size="small"
                              >
                                <Tooltip
                                  {...tooltipOptions}
                                  title={(
                                    <>
                                      <strong>S'inscrire</strong><br />
                                      ({fieldLabel[place][moment]} uniquement)
                                    </>
                                  )}
                                >
                                  <AddCircle />
                                </Tooltip>
                              </IconButton>
                            )}
                          </Grid>
                        );
                      })}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      <Footer />
    </div>
  );
}

export default App;
