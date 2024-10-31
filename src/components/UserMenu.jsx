import React from 'react';
import createPersistedState from 'use-persisted-state';

import { ArrowDropDown, Logout, Person } from '@mui/icons-material';
import { alpha, Box, Button, IconButton, Menu, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

import PreferencesDisplay from './PreferencesDisplay';
import PreferencesFavorites from './PreferencesFavorites';
import PreferencesTri from './PreferencesTri';
import adapter from '../keycloak';

const { keycloak } = adapter;

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
    btn: {
      background: alpha(theme.palette.error.main, 0.1),
      color: theme.palette.error.main,
      textTransform: 'none',
      border: 'unset',
      '&:hover': {
        color: 'white',
        background: theme.palette.error.main,
      },
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
        <Typography sx={{ paddingLeft: 2, paddingTop: 2 }} gutterBottom variant="h6">
          Réglages
        </Typography>
        <PreferencesDisplay />
        <PreferencesFavorites />
        <PreferencesTri />

        <Box sx={{ px: 2, pt: 3, pb: 1 }}>
          <Button
            variant="contained"
            fullWidth
            endIcon={<Logout />}
            className={classes.btn}
            disableElevation
            onClick={() => keycloak.logout()}
          >
            Se déconnecter
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default React.memo(UserMenu);
