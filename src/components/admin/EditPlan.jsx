import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import createPersistedState from 'use-persisted-state';
import useSpots from '../../hooks/useSpots';
import ActionBar from './ActionBar';
import EditSpot from './EditSpot';
import { CREATED_KEY, SPOT_ENTITY } from './SpotDialog';
import { DELETED_KEY } from './SpotPanel';
import useAdditionals from '../../hooks/useAdditionals';
import EditAdditional from './EditAdditional';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    height: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  wrapper: {
    width: '100%',
    flexGrow: '1',
    position: 'relatve',
    backgroundSize: '20px 20px',
    backgroundImage: 'linear-gradient(to right, #e3e3e3 1px, transparent 1px), linear-gradient(to bottom, #e3e3e3 1px, transparent 1px)',
  },
  planWrapper: {
  },
  cardEdit: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 0,
    borderBottom: '1px solid #00000030',
    borderLeft: '1px solid #00000030',
    borderBottomLeftRadius: '10px',
    padding: theme.spacing(0, 2),
  },
  textField: {
    '& .MuiOutlinedInput-input': {
      padding: theme.spacing(0.5, 1),
    },
    width: '75px',
  },
}));

const useUpdateStack = createPersistedState('updateStack');
const usePlanUpdate = createPersistedState('planUpdate');
const useMapping = createPersistedState('mapping');

export const ADDITIONAL_ENTITY = 'additional';

function EditPlan ({ handleClick, updatedSpot, setUpdatedSpot, panelOpen }) {
  const classes = useStyles();
  const { place } = useParams();

  const [planUpdate] = usePlanUpdate();

  const [mapping] = useMapping();
  const placeID = mapping[place];

  const [updateStack, setUpdateStack] = useUpdateStack({});
  const spotStack = updateStack[placeID].filter(({ entity }) => entity === SPOT_ENTITY);
  const additionalStack = updateStack[placeID].filter(({ entity }) => entity === ADDITIONAL_ENTITY);

  const [selectedSpot, setSelectedSpot] = useState({});

  const planRef = useRef(null);
  const movingSpotRef = useRef(null);

  const onSpotSelect = spot => {
    setSelectedSpot({
      ...spot,
    });
    handleClick(spot);
  };

  const handleMove = event => {
    if (movingSpotRef.current) {
      movingSpotRef.current.handleMove(event);
    }
  };

  const keepSpotUpdate = (spot, index) => {
    const { Identifiant: spotId } = spot;
    // Is not the last one
    if (index !== updateStack[placeID].length - 1) return true;

    // Is the last, ID is different from the new update
    if (spotId !== updatedSpot.Identifiant) return true;

    // Is the last, IDs are the same, and the spot was created last action
    const isCreated = Object.hasOwn(spot, CREATED_KEY)
      && updateStack[placeID].findIndex(
        ({ Identifiant }) => Identifiant === spot.Identifiant,
      ) === index;
    if (isCreated) return true;

    // Is the last, IDs are the same, the spot wasn't created last action
    // and last update isn't position/description related
    const [diff] = Object.keys(spot).filter(k => spot[k] !== updatedSpot[k]);
    if (diff !== 'x' && diff !== 'y' && diff !== 'Description') return true;

    return false;
  };

  useEffect(() => {
    if (Object.keys(updatedSpot).length) {
      setUpdateStack({
        ...updateStack,
        [placeID]: [
          ...updateStack[placeID].filter((spot, index) => keepSpotUpdate(spot, index)),
          updatedSpot,
        ],
      });
      setUpdatedSpot({});
    }
  }, [updatedSpot]);

  const idSpotStack = spotStack.map(({ Identifiant: spotId }) => spotId);
  const spots = useSpots(placeID)
    .spots
    .map(spot => ({
      ...spot,
      entity: SPOT_ENTITY,
    }))
    // add created spot
    .concat([...new Set(
      spotStack
        .filter(spot => Object.hasOwn(spot, CREATED_KEY))
        .map(({ Identifiant }) => Identifiant),
    )].map(Identifiant => spotStack[
      spotStack.findLastIndex(({ Identifiant: spotId }) => spotId === Identifiant)
    ]))
    // remove deleted spot
    .filter(spot => {
      if (idSpotStack.includes(spot.Identifiant)
        && Object.hasOwn(
          spotStack[idSpotStack.lastIndexOf(spot.Identifiant)], DELETED_KEY,
        )) {
        return false;
      }
      return true;
    })
    // update updated spot
    .map(spot => {
      if (idSpotStack.includes(spot.Identifiant)) {
        return spotStack[idSpotStack.lastIndexOf(spot.Identifiant)];
      }
      return spot;
    });

  // const idAdditionalStack = additionalStack.map(({ id }) => id);
  const additionals = useAdditionals(placeID)
    .map(additional => ({
      ...additional,
      entity: ADDITIONAL_ENTITY,
    }))
    .concat([...new Set(
      additionalStack
        .filter(additional => Object.hasOwn(additional, CREATED_KEY))
        .map(({ id }) => id),
    )].map(additionalID => additionalStack[
      additionalStack.findLastIndex(({ id }) => id === additionalID)
    ]));

  const { plan: [plan] = [] } = planUpdate.find(({ Name }) => Name === place) || {};

  return (
    <Box
      className={classes.root}
      onPointerMove={handleMove}
    >
      <ActionBar onUndoRedu={onSpotSelect} />
      <TransformWrapper
        ref={planRef}
        disabled
        id="planContainer"
      >
        <TransformComponent
          wrapperClass={classes.wrapper}
          id="plan"
        >
          <Box className={classes.planWrapper}>
            {plan?.url && (
            <img
              src={plan.url}
              alt=""
              className={classes.plan}
              id={place}
              onLoad={() => {
                planRef.current.zoomToElement(place, undefined, 300);
              }}
            />
            )}
            {spots.map(Spot => (
              <EditSpot
                key={Spot.Identifiant}
                spot={Spot}
                isSelected={selectedSpot.Identifiant === Spot.Identifiant && panelOpen}
                onClick={onSpotSelect}
                planRef={planRef}
                ref={movingSpotRef}
              />
            ))}
            {additionals.map(additional => (
              <EditAdditional
                key={additional.Titre}
                additional={additional}
              />
            ))}
          </Box>

        </TransformComponent>
      </TransformWrapper>
    </Box>
  );
}

export default React.memo(EditPlan);
