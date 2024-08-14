import { KeyboardArrowLeft, KeyboardArrowRight, Place } from '@mui/icons-material';
import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import createPersistedState from 'use-persisted-state';

const useStyles = makeStyles(theme => {
  const maxWidth = mq => `@media (max-width: ${theme.breakpoints.values[mq]}px)`;

  return {
    root: {
      width: '100%',
      // background: 'red',
      padding: theme.spacing(0.5),
      borderBottom: '2px solid #00000015',
      display: 'flex',
    },
    button: {
      display: 'flex',
      padding: theme.spacing(0.3),
      border: 'unset',
      background: 'unset',
      borderRadius: '5px',
      transition: 'all 100ms cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transition: 'all 100ms cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'rgba(0, 0, 0, 0.05);',
        cursor: 'pointer',
      },
    },
  };
});

const useUpdatedStack = createPersistedState('updateStack');
const useUndidStack = createPersistedState('undidStack');

function ActionBar () {
  const classes = useStyles();
  const { place } = useParams();

  const [updateStack, setUpdatedStack] = useUpdatedStack({});
  const [undidStack, setUndidStack] = useUndidStack({});

  const handleUndo = () => {
    setUndidStack({
      ...undidStack,
      [place]: [
        ...undidStack[place],
        updateStack[place][updateStack[place].length - 1],
      ],
    });
    setUpdatedStack({
      ...updateStack,
      [place]: [
        ...updateStack[place].slice(0, -1),
      ],
    });
  };

  const handleRedo = () => {
    setUpdatedStack({
      ...updateStack,
      [place]: [
        ...updateStack[place],
        undidStack[place][undidStack[place].length - 1],
      ],
    });
    setUndidStack({
      ...undidStack,
      [place]: [
        ...undidStack[place].slice(0, -1),
      ],
    });
  };

  return (
    <Box className={classes.root}>
      <Box
        className={classes.button}
        component="button"
        disabled={updateStack[place].length === 0}
        onClick={handleUndo}
      >
        <KeyboardArrowLeft />
      </Box>
      <Box
        className={classes.button}
        component="button"
        disabled={undidStack[place].length === 0}
        onClick={handleRedo}
      >
        <KeyboardArrowRight />
      </Box>
    </Box>
  );
}

export default React.memo(ActionBar);
