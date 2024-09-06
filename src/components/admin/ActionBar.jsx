import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { Box, Button, Tooltip } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import createPersistedState from 'use-persisted-state';
import useSpots from '../../hooks/useSpots';
import SpotDialog from './SpotDialog';
import usePlans from '../../hooks/usePlans';
import PublishDialog from './PublishDialog';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    borderBottom: '2px solid #00000015',
    borderLeft: '1px solid #00000015',
    display: 'flex',
    justifyContent: 'space-between',
  },
  editActions: {
    display: 'inherit',
    alignItems: 'center',
  },
  publishActions: {
    display: 'inherit',
    alignItems: 'center',
    padding: theme.spacing(0.5, 1, 0.5, 0.5),
    gap: theme.spacing(0.5),
  },
  section: {
    padding: theme.spacing(1),
    display: 'inherit',
  },
  button: {
    display: 'flex',
    padding: theme.spacing(0.5),
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
  btnPublish: {
    textTransform: 'none',
  },
}));

const useUpdateStack = createPersistedState('updateStack');
const useUndidStack = createPersistedState('undidStack');
const useMapping = createPersistedState('mapping');
const usePlanUpdate = createPersistedState('planUpdate');

function ActionBar ({ onUndoRedu }) {
  const classes = useStyles();
  const { place } = useParams();
  const [mapping] = useMapping();
  const placeID = mapping[place];

  const [updateStack, setUpdateStack] = useUpdateStack({});
  const [undidStack, setUndidStack] = useUndidStack({});
  const [planUpdate] = usePlanUpdate();

  const { spots: defaultSpot } = useSpots(placeID);

  const getPreviousSpotInfo = () => {
    const spot = updateStack[placeID][updateStack[placeID].length - 1];
    const spotHistory = updateStack[placeID]
      .filter(({ Identifiant }) => Identifiant === spot.Identifiant);
    if (spotHistory.length === 1) {
      return defaultSpot.find(({ Identifiant }) => Identifiant === spot.Identifiant);
    }
    return spotHistory[spotHistory.length - 2];
  };

  const handleUndo = () => {
    onUndoRedu(getPreviousSpotInfo());
    setUndidStack({
      ...undidStack,
      [placeID]: [
        ...undidStack[placeID],
        updateStack[placeID][updateStack[placeID].length - 1],
      ],
    });
    setUpdateStack({
      ...updateStack,
      [placeID]: [
        ...updateStack[placeID].slice(0, -1),
      ],
    });
  };

  const handleRedo = () => {
    onUndoRedu(undidStack[placeID][undidStack[placeID].length - 1]);
    setUpdateStack({
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
      setUpdateStack({
        ...updateStack,
        [placeID]: [
          ...updateStack[placeID],
          spotInfo,
        ],
      });
    }
  };

  const { plans } = usePlans();
  const changedPlan = planUpdate.filter((plan, index) => {
    if (index < plans.length) {
      return plan.Name !== plans[index].Name || plan.Brouillon !== plans[index].Brouillon;
    }
    return false;
  });

  const isBrouillon = planUpdate.find(({ Name }) => Name === place).Brouillon;
  const hasModification = changedPlan.map(({ Name }) => Name).includes(place)
  || !plans.map(({ Name }) => Name).includes(place)
  || Boolean(updateStack[placeID].length);

  const [publishOpen, setPublishOpen] = useState(false);
  const [liveAndPublish, setLiveAndPublish] = useState(false);

  const onClosePublication = () => {
    setPublishOpen(!publishOpen);
  };

  return (
    <>
      <Box className={classes.root}>
        <Box className={classes.editActions}>

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
                <img src="/add_spot.svg" alt="add spot" className={classes.svg} />
              </Box>
            </Tooltip>
          </Box>
        </Box>
        <Box className={classes.publishActions}>
          {isBrouillon && (
          <Button
            variant="outlined"
            size="medium"
            disableElevation
            className={classes.btnPublish}
            onClick={() => {
              setPublishOpen(!publishOpen);
              setLiveAndPublish(true);
            }}
          >Publier
          </Button>
          )}
          {hasModification && (
            <Button
              variant="contained"
              size="medium"
              disableElevation
              className={classes.btnPublish}
              onClick={() => {
                setPublishOpen(!publishOpen);
                setLiveAndPublish(false);
              }}
            >Enregistrer
            </Button>
          )}
        </Box>
      </Box>
      {dialogOpen && (
        <SpotDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
        />
      )}
      {publishOpen && (
        <PublishDialog
          open={publishOpen}
          handleClose={onClosePublication}
          plan={planUpdate.find(({ Name }) => Name === place)}
          isSecondary={liveAndPublish}
        />
      )}
    </>

  );
}

export default React.memo(ActionBar);
