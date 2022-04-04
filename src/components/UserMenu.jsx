import React from 'react';
import createPersistedState from 'use-persisted-state';

import { IconButton, Button, Menu, MenuItem, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material';
import { Person, DarkMode, WbSunny, SettingsBrightness, ArrowDropDown } from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';

const useTriState = createPersistedState('tri');
const useThemePrefs = createPersistedState('themePref');

const useStyles = makeStyles(theme => {
  const maxWidth = mq => `@media (max-width: ${theme.breakpoints.values[mq]}px)`;
  const minWidth = mq => `@media (min-width: ${theme.breakpoints.values[mq]}px)`;

  return {
    icon: {
      [minWidth('md')]: { display: 'none' },
    },
    themeIcon: {
      marginRight: 7,
      fill: theme.palette.mode === 'dark' ? 'white' : 'black',
    },
    themeLabel: {
      textTransform: 'none',
    },
    text: {
      textTransform: 'none',
      marginLeft: theme.spacing(1),
      [maxWidth('md')]: { display: 'none' },
    },
  };
});

const UserMenu = () => {
  const [tri, setTri] = useTriState();
  const [themePrefs, setThemePrefs] = useThemePrefs();

  const classes = useStyles();

  const handleChangeTri = () => setTri('');

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        className={classes.icon}
        onClick={handleClick}
        size="small"
        color="primary"
        title={tri}
      >
        <Person />
      </IconButton>

      <Button
        className={classes.text}
        onClick={handleClick}
        color="primary"
        startIcon={<Person />}
        endIcon={<ArrowDropDown />}
      >
        {tri}
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <Typography style={{ paddingLeft: 10 }} variant="overline" display="block" gutterBottom>
          Thème
        </Typography>
        <ToggleButtonGroup
          size="small"
          value={themePrefs}
          exclusive
          style={{ paddingLeft: 10, paddingRight: 10, marginBottom: 10 }}
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
        <MenuItem onClick={handleChangeTri}>Changer trigramme</MenuItem>
      </Menu>
    </>
  );
};

export default React.memo(UserMenu);
