import React from 'react';
import clsx from 'clsx';

import dayjs from 'dayjs';
import fr from 'dayjs/locale/fr';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import dayOfYear from 'dayjs/plugin/dayOfYear';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import {
  Card,
  Container,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import {
  Archive as ArchiveIcon,
  ControlPointDuplicate as ControlPointDuplicateIcon,
} from '@mui/icons-material';

import Footer from './Footer';
import useBackups from '../hooks/useBackup';

const { VITE_ARCHIVE_ROOT } = import.meta.env;

const Days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const Months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(dayOfYear);

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2),
  },
  current: {
    background: '#eee',
  },
}));

const ArchivePage = () => {
  const classes = useStyles();
  const backups = useBackups();
  const today = dayjs(dayjs().format('YYYY-MM-DD')); // Wacky trick to strip time
  const [selectedDate, setSelectedDate] = React.useState(today);

  const availableDates = backups.map(filename => {
    const { 1: date } = filename.match(/(.*)\.(csv|tgz)$/) || {};
    return date ? dayjs(date) : null;
  }).filter(Boolean);

  const matchingFiles = backups.filter(filename => {
    const { 1: dateString } = filename.match(/(.*)\.(csv|tgz)$/) || {};
    return dayjs(dateString).isoWeek() === selectedDate.isoWeek();
  });

  return (
    <div className="ArchivePage">
      <Container className={classes.root}>

        <Grid container spacing={2} justifyContent="center" alignItems="flex-start">
          <Grid item xs={12} sm={6} md={4} lg={3}>

            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={fr}>
              <DateCalendar
                disableFuture
                value={selectedDate}
                onChange={day => setSelectedDate(dayjs(day))}
                shouldDisableDate={day => availableDates.every(date => !dayjs(day).isSame(date, 'day'))}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Card>

              <List>
                {matchingFiles.map(item => {
                  const { 1: iso, 2: ext } = item.match(/(.*)\.(.*)$/);
                  const date = dayjs(iso);
                  const textDate = `${Days[date.day()]} ${date.date()} ${Months[date.month()]}`;

                  return (
                    <ListItem
                      key={item}
                      component="a"
                      href={`${VITE_ARCHIVE_ROOT}/${item}`}
                      dense
                      button
                      className={clsx({ [classes.current]: date.isSame(selectedDate, 'day') })}
                    >
                      <ListItemIcon>
                        {ext === 'csv' ? <ControlPointDuplicateIcon /> : <ArchiveIcon />}
                      </ListItemIcon>

                      <ListItemText primary={textDate} secondary={item} />
                    </ListItem>
                  );
                })}
              </List>
            </Card>
          </Grid>
        </Grid>

      </Container>
      <Footer />
    </div>
  );
};

export default ArchivePage;
