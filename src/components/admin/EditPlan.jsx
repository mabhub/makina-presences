import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import createPersistedState from 'use-persisted-state';
import useSpots from '../../hooks/useSpots';
import ActionBar from './ActionBar';
import EditSpot from './EditSpot';
import useAdditionals from '../../hooks/useAdditionals';
import EditAdditional from './EditAdditional';
import { ADDITIONAL_ENTITY, CREATED_KEY, DELETED_KEY, SPOT_ENTITY } from './const';

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
  plan: {
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

function EditPlan ({ handleClick, updatedSpot, setUpdatedSpot, panelOpen }) {
  const classes = useStyles();
  const { place } = useParams();

  const [planUpdate] = usePlanUpdate();

  const [mapping] = useMapping();
  const placeID = mapping[place];

  const [updateStack, setUpdateStack] = useUpdateStack({});
  const spotUpdateStack = updateStack[placeID]
    .filter(({ entity }) => entity === SPOT_ENTITY);
  const additionalUpdateStack = updateStack[placeID]
    .filter(({ entity }) => entity === ADDITIONAL_ENTITY);

  const [selectedEntity, setSelectedEntity] = useState({});

  const planRef = useRef(null);
  const movingSpotRef = useRef(null);

  const onEntitySelect = entity => {
    setSelectedEntity({
      ...entity,
    });
    handleClick(entity);
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

  const idSpotUpdateStack = spotUpdateStack.map(({ Identifiant: spotId }) => spotId);
  const spots = useSpots(placeID)
    .spots
    .map(spot => ({
      ...spot,
      entity: SPOT_ENTITY,
    }))
    // add created spot
    .concat([...new Set(
      spotUpdateStack
        .filter(spot => Object.hasOwn(spot, CREATED_KEY))
        .map(({ Identifiant }) => Identifiant),
    )].map(Identifiant => spotUpdateStack[
      spotUpdateStack.findLastIndex(({ Identifiant: spotId }) => spotId === Identifiant)
    ]))
    // remove deleted spot
    .filter(spot => {
      if (idSpotUpdateStack.includes(spot.Identifiant)
        && Object.hasOwn(
          spotUpdateStack[idSpotUpdateStack.lastIndexOf(spot.Identifiant)], DELETED_KEY,
        )) {
        return false;
      }
      return true;
    })
    // update updated spot
    .map(spot => {
      if (idSpotUpdateStack.includes(spot.Identifiant)) {
        return spotUpdateStack[idSpotUpdateStack.lastIndexOf(spot.Identifiant)];
      }
      return spot;
    });

  const idAdditionalUpdateStack = additionalUpdateStack.map(({ id }) => id);
  const additionals = useAdditionals(placeID)
    .map(additional => ({
      ...additional,
      entity: ADDITIONAL_ENTITY,
    }))
    // add created additional
    .concat([...new Set(
      additionalUpdateStack
        .filter(additional => Object.hasOwn(additional, CREATED_KEY))
        .map(({ id }) => id),
    )].map(additionalID => additionalUpdateStack[
      additionalUpdateStack.findLastIndex(({ id }) => id === additionalID)
    ]))
    // update updated additional
    .map(additional => {
      if (idAdditionalUpdateStack.includes(additional.id)) {
        return additionalUpdateStack[idAdditionalUpdateStack.lastIndexOf(additional.id)];
      }
      return additional;
    })
    // remove deleted additional
    .filter(additional => {
      if (idAdditionalUpdateStack.includes(additional.id)
        && Object.hasOwn(
          additionalUpdateStack[idAdditionalUpdateStack.lastIndexOf(additional.id)], DELETED_KEY,
        )) {
        return false;
      }
      return true;
    });

  const { plan: [plan] = [] } = planUpdate.find(({ Name }) => Name === place) || {};

  return (
    <Box
      className={classes.root}
      onPointerMove={handleMove}
    >
      <ActionBar onUndoRedu={onEntitySelect} />
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
                isSelected={selectedEntity.entity === SPOT_ENTITY
                  && selectedEntity.Identifiant === Spot.Identifiant
                  && panelOpen}
                onClick={onEntitySelect}
                planRef={planRef}
                ref={movingSpotRef}
              />
            ))}
            {additionals.map(additional => (
              <EditAdditional
                key={additional.Titre}
                additional={additional}
                onSelect={onEntitySelect}
                isSelected={selectedEntity.entity === ADDITIONAL_ENTITY
                    && selectedEntity.id === additional.id
                    && panelOpen}
              />
            ))}
          </Box>

        </TransformComponent>
      </TransformWrapper>
    </Box>
  );
}

export default React.memo(EditPlan);
