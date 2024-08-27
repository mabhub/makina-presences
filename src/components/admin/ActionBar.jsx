import { AddCircleOutline, KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { Box, Tooltip } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import createPersistedState from 'use-persisted-state';
import NewSpotDialog from './NewSpotDialog';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    // background: 'red',
    borderBottom: '2px solid #00000015',
    borderLeft: '1px solid #00000015',
    display: 'flex',
  },
  section: {
    padding: theme.spacing(0.5),
    display: 'inherit',
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
  separator: {
    margin: theme.spacing(0, 1, 0, 0.5),
    borderRight: '2px solid #00000015',
    height: '100%',
  },
  svg: {
    height: '24px',
  },
}));

const useUpdatedStack = createPersistedState('updateStack');
const useUndidStack = createPersistedState('undidStack');
const useMapping = createPersistedState('mapping');

function ActionBar () {
  const classes = useStyles();
  const { place } = useParams();
  const [mapping] = useMapping();
  const placeID = mapping[place];

  const [updateStack, setUpdatedStack] = useUpdatedStack({});
  const [undidStack, setUndidStack] = useUndidStack({});

  const handleUndo = () => {
    setUndidStack({
      ...undidStack,
      [placeID]: [
        ...undidStack[placeID],
        updateStack[placeID][updateStack[placeID].length - 1],
      ],
    });
    setUpdatedStack({
      ...updateStack,
      [placeID]: [
        ...updateStack[placeID].slice(0, -1),
      ],
    });
  };

  const handleRedo = () => {
    setUpdatedStack({
      ...updateStack,
      [placeID]: [
        ...updateStack[placeID],
        undidStack[placeID][undidStack[placeID].length - 1],
      ],
    });
    setUndidStack({
      ...undidStack,
      [placeID]: [
        ...undidStack[placeID].slice(0, -1),
      ],
    });
  };

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCloseDialog = spotInfo => {
    setDialogOpen(false);
    if (spotInfo) {
      // Remove undid changes when a new spot is created
      setUndidStack(Object.keys(undidStack)
        .reduce((acc, curr) => ({
          ...acc,
          [curr]: [],
        }), {}));
      setUpdatedStack({
        ...updateStack,
        [placeID]: [
          ...updateStack[placeID],
          spotInfo,
        ],
      });
    }
  };

  return (
    <>
      <Box className={classes.root}>
        <Box className={classes.section}>
          <Tooltip
            title="Annuler"
          >
            <span>
              <Box
                className={classes.button}
                component="button"
                disabled={updateStack[placeID].length === 0}
                onClick={handleUndo}
              >
                <KeyboardArrowLeft />
              </Box>
            </span>
          </Tooltip>
          <Tooltip
            title="Refaire"
          >
            <span>

              <Box
                className={classes.button}
                component="button"
                disabled={undidStack[placeID].length === 0}
                onClick={handleRedo}
              >
                <KeyboardArrowRight />
              </Box>
            </span>
          </Tooltip>
        </Box>

        <div className={classes.separator} />
        <Box className={classes.section}>
          <Tooltip
            title="Nouveau Poste"
          >
            <Box
              className={classes.button}
              component="button"
              onClick={() => (setDialogOpen(true))}
            >
              {/* <AddCircleOutline /> */}
              <img src="/add_spot.svg" alt="add spot" className={classes.svg} />
            </Box>
          </Tooltip>
        </Box>
      </Box>
      {dialogOpen && (
        <NewSpotDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
        />
      )}
    </>

  );
}

export default React.memo(ActionBar);
