import React from 'react';
import createPersistedState from 'use-persisted-state';

import { DarkMode, Fullscreen, SettingsBrightness, WbSunny } from '@mui/icons-material';
import { Divider, List, ListItem, ListItemIcon, ListItemText, Switch, ToggleButton, ToggleButtonGroup } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

const useMaxWidthState = createPersistedState('useMaxWidth');
const useThemePrefs = createPersistedState('themePref');

const useStyles = makeStyles(() => ({
  themeIcon: {
    marginRight: 7,
    fill: 'currentColor',
  },
  themeLabel: {
    textTransform: 'none',
  },
}));

const PreferenceDisplay = () => {
  const [useMaxWidth, setUseMaxWidth] = useMaxWidthState();
  const [themePrefs, setThemePrefs] = useThemePrefs('system');

  const classes = useStyles();

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
