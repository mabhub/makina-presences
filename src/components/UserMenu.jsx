import React from 'react';
import createPersistedState from 'use-persisted-state';

import { ArrowDropDown, Done, Edit, Person } from '@mui/icons-material';
import { Box, Button, Divider, IconButton, Menu, TextField, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

import PreferencesDisplay from './PreferencesDisplay';
import PreferencesSpot from './PreferencesSpot';

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
  const [tri, setTri] = useTriState();
  const [disableInput, setDisableInput] = React.useState(true);
  const [textValue, setTextValue] = React.useState(tri);

  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSubmit = () => {
    if (!disableInput) setTri(textValue);
    setDisableInput(!disableInput);
  };

  const handleKeyPress = event => {
    if (event.charCode === 13) {
      handleSubmit();
    }
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

        <PreferencesSpot />

        <Divider textAlign="left">Trigramme</Divider>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', mx: '16px', my: '10px' }}>
          <TextField
            fullWidth
            size="small"
            defaultValue={textValue}
            inputProps={{
              maxLength: 10,
            }}
            inputRef={input => input && input.focus()}
            disabled={disableInput}
            onKeyPress={handleKeyPress}
            onChange={event => (setTextValue(event.target.value))}
          />
          <IconButton
            sx={{ ml: 1 }}
            onClick={handleSubmit}
          >
            {disableInput
              ? <Edit color="primary" />
              : (
                <Done
                  color="primary"
                />
              )}
          </IconButton>
        </Box>

      </Menu>
    </>
  );
};

export default React.memo(UserMenu);
