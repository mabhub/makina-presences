import React from 'react';
import createPersistedState from 'use-persisted-state';

import { CalendarToday, DarkMode, EventBusy, Fullscreen, Looks3, LooksOne, LooksTwo, SettingsBrightness, WbSunny } from '@mui/icons-material';
import { Box, Divider, List, ListItem, ListItemIcon, ListItemText, Switch, ToggleButton, ToggleButtonGroup } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

const useMaxWidthState = createPersistedState('useMaxWidth');
const useThemePrefs = createPersistedState('themePref');
const useWeekPrefs = createPersistedState('weekPref');
const useDayPrefs = createPersistedState('dayPrefs');
const usePastDays = createPersistedState('pastDays');

const useStyles = makeStyles(() => ({
  themeIcon: {
    marginRight: 7,
    fill: 'currentColor',
  },
  themeLabel: {
    textTransform: 'none',
  },
  toggleButton: {
    '&.MuiToggleButton-root': {
      width: '100px',
    },
  },
}));

const PreferenceDisplay = () => {
  const weekDay = ['L', 'M', 'Me', 'J', 'V'];

  const [useMaxWidth, setUseMaxWidth] = useMaxWidthState();
  const [themePrefs, setThemePrefs] = useThemePrefs('system');
  const [weekPrefs, setWeekprefs] = useWeekPrefs('2');
  const [dayPrefs, setDayPrefs] = useDayPrefs(weekDay);
  const [pastDays, setPastDays] = usePastDays(true);

  const classes = useStyles();

  const handleDayPref = day => {
    if (dayPrefs.includes(day)) {
      setDayPrefs(dayPrefs.filter(d => d !== day));
    } else {
      setDayPrefs([
        ...dayPrefs,
        day,
      ]);
    }
  };

  return (
    <>
      <Divider textAlign="left">Affichage</Divider>
      <List dense>
        <ListItem>
          <ToggleButtonGroup
            size="small"
            value={themePrefs}
            exclusive
            fullWidth
          >
            <ToggleButton onClick={() => setThemePrefs('dark')} value="dark">
              <DarkMode className={classes.themeIcon} />
              <span className={classes.themeLabel}>Sombre</span>
            </ToggleButton>
            <ToggleButton onClick={() => setThemePrefs('system')} value="system">
              <SettingsBrightness className={classes.themeIcon} />
              <span className={classes.themeLabel}>Système</span>
            </ToggleButton>
            <ToggleButton onClick={() => setThemePrefs('light')} value="light">
              <WbSunny className={classes.themeIcon} />
              <span className={classes.themeLabel}>Clair</span>
            </ToggleButton>
          </ToggleButtonGroup>
        </ListItem>
        <ListItem>
          <ToggleButtonGroup
            size="small"
            exclusive
            fullWidth
            value={weekPrefs}
          >
            <ToggleButton value="1" className={classes.toggleButton} onClick={() => setWeekprefs('1')}>
              <LooksOne />
              <span className={classes.themeLabel}>semaine</span>
            </ToggleButton>
            <ToggleButton value="2" className={classes.toggleButton} onClick={() => setWeekprefs('2')}>
              <LooksTwo />
              <span className={classes.themeLabel}>semaines</span>
            </ToggleButton>
            <ToggleButton value="3" className={classes.toggleButton} onClick={() => setWeekprefs('3')}>
              <Looks3 />
              <span className={classes.themeLabel}>semaines</span>
            </ToggleButton>
          </ToggleButtonGroup>
        </ListItem>
        <ListItem sx={{ height: '46px' }}>
          <ListItemIcon sx={{ marginRight: '-25px' }}><CalendarToday /></ListItemIcon>
          <ListItemText>Jours </ListItemText>
          <Box sx={{ display: 'flex', gap: '3px' }}>
            {weekDay.map(day => {
              const SIZE = 30;
              return (
                <Box
                  component="button"
                  key={day}
                  sx={{
                    background: (dayPrefs.includes(day) ? 'rgba(0, 0, 0, 0.08)' : '#FFFFFF'),
                    filter: theme => (theme.palette.mode === 'dark' ? 'invert(100%)' : 'invert(0%)'),
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                    borderRadius: '8px',
                    width: `${SIZE}px`,
                    height: `${SIZE}px`,
                    fontSize: `calc(${SIZE}px / 2.2)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      cursor: 'pointer',
                      background: (dayPrefs.includes(day) ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.04)'),
                    },
                  }}
                  onClick={() => handleDayPref(day)}
                >
                  {day}
                </Box>
              );
            })}

          </Box>
        </ListItem>
        <ListItem sx={{ height: '38px' }}>
          <ListItemIcon sx={{ marginRight: '-25px' }}><EventBusy /></ListItemIcon>
          <ListItemText>Jours passés</ListItemText>
          <Switch
            checked={pastDays}
            onChange={() => {
              setPastDays(!pastDays);
            }}
          />
        </ListItem>
        <ListItem sx={{ height: '38px' }}>
          <ListItemIcon sx={{ marginRight: '-25px' }}><Fullscreen /></ListItemIcon>
          <ListItemText primary="Pleine largeur" />
          <Switch
            checked={useMaxWidth}
            onChange={() => {
              setUseMaxWidth(!useMaxWidth);
            }}
          />
        </ListItem>

      </List>
    </>
  );
};

export default React.memo(PreferenceDisplay);