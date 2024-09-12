import React from 'react';
import createPersistedState from 'use-persisted-state';

import { ArrowDropDown, Person } from '@mui/icons-material';
import { Button, IconButton, Menu, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

import PreferencesDisplay from './PreferencesDisplay';
import PreferencesTri from './PreferencesTri';
import PreferencesFavorites from './PreferencesFavorites';

const useTriState = createPersistedState('tri');

const useStyles = makeStyles(theme => {
  const maxWidth = mq => `@media (max-width: ${theme.breakpoints.values[mq]}px)`;
  const minWidth = mq => `@media (min-width: ${theme.breakpoints.values[mq]}px)`;

  return {
    icon: {
      [minWidth('md')]: { display: 'none' },
    },
    text: {
      textTransform: 'none',
      marginLeft: theme.spacing(1),
      [maxWidth('md')]: { display: 'none' },
    },
  };
});

const UserMenu = () => {
  const [tri] = useTriState();

  const classes = useStyles();

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
        <Typography style={{ paddingLeft: 10, paddingTop: 10 }} gutterBottom variant="h6">
          Préferences
        </Typography>
        <PreferencesDisplay />
        <PreferencesFavorites />
        <PreferencesTri />
      </Menu>
    </>
  );
};

export default React.memo(UserMenu);
