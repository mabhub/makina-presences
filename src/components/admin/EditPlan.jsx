import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import createPersistedState from 'use-persisted-state';
import useSpots from '../../hooks/useSpots';
import ActionBar from './ActionBar';
import EditSpot from './EditSpot';
import { CREATED_KEY } from './NewSpotDialog';
import { DELETED_KEY } from './SpotPanel';

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
    border: '1px solid red',
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

const useUpdatedStack = createPersistedState('updateStack');
const usePlanUpdate = createPersistedState('planUpdate');
const useMapping = createPersistedState('mapping');

function EditPlan ({ handleClick, updatedSpot, setUpdatedSpot, panelOpen }) {
  const classes = useStyles();
  const { place } = useParams();

  const [planUpdate] = usePlanUpdate();

  const [mapping] = useMapping();
  const placeID = mapping[place];

  const [updateStack, setUpdatedStack] = useUpdatedStack({});

  const [movingSpot, setMovingSpot] = useState({});
  const [ghostSpot, setGhostSpot] = useState();
  const [deltas, setDeltas] = useState({
    x: 0,
    y: 0,
  });

  const [selectedSpot, setSelectedSpot] = useState({});

  const onSpotSelect = spot => {
    // console.log('select');
    setSelectedSpot({
      ...spot,
    });
    handleClick(spot);
  };

  // console.log(selectedSpot);

  const snap = (v, a = 5) => Math.round(v / a) * a;
  const planRef = useRef(null);

  const updatePointPosition = (point, event) => {
    const { current: { state: { scale } = {} } = {} } = planRef;
    return {
      ...point,
      x: snap((event.clientX - deltas.x) / scale),
      y: snap((event.clientY - deltas.y) / scale),
    };
  };

  const handleMoveStart = (clicPosition, spot) => {
    const { current: { state: { scale } = {} } = {} } = planRef;
    setMovingSpot({
      ...spot,
    });
    setGhostSpot({
      ...spot,
    });
    setDeltas({
      x: clicPosition.x - (spot.x * scale),
      y: clicPosition.y - (spot.y * scale),
    });
  };

  const handleMove = event => {
    if (Object.keys(movingSpot).length === 0) return;
    setMovingSpot({
      ...updatePointPosition(movingSpot, event),
    });
  };

  const handleMoveEnd = event => {
    if (Object.keys(movingSpot).length === 0) return;
    setUpdatedStack({
      ...updateStack,
      [placeID]: [
        ...updateStack[placeID],
        {
          ...updatePointPosition(movingSpot, event),
        },
      ],
    });
    setMovingSpot({});
    setGhostSpot();
  };

  const handleMoveUndo = () => {
    setMovingSpot({});
    setGhostSpot();
    // setSelectedSpot({});
    // onSpotSelect(spot);
    onSpotSelect(movingSpot);
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
    // console.log(updatedSpot);
    if (Object.keys(updatedSpot).length) {
      setUpdatedStack({
        ...updateStack,
        [placeID]: [
          ...updateStack[placeID].filter((spot, index) => keepSpotUpdate(spot, index)),
          updatedSpot,
        ],
      });
      setUpdatedSpot({});
    }
  }, [updatedSpot]);

  const idUpdateStack = updateStack[placeID].map(({ Identifiant: spotId }) => spotId);
  const spots = useSpots(placeID)
    // add created spot
    .concat([...new Set(
      updateStack[placeID]
        .filter(spot => Object.hasOwn(spot, CREATED_KEY))
        .map(({ Identifiant }) => Identifiant),
    )].map(Identifiant => updateStack[placeID][
      updateStack[placeID].findLastIndex(({ Identifiant: spotId }) => spotId === Identifiant)
    ]))
    // remove deleted spot
    .filter(spot => {
      if (idUpdateStack.includes(spot.Identifiant)
        && Object.hasOwn(
          updateStack[placeID][idUpdateStack.lastIndexOf(spot.Identifiant)], DELETED_KEY,
        )) {
        return false;
      }
      return true;
    })
    // update updated spot
    .map(spot => {
      if (idUpdateStack.includes(spot.Identifiant)) {
        return updateStack[placeID][idUpdateStack.lastIndexOf(spot.Identifiant)];
      }
      return spot;
    })
    // update moving spot
    .map(spot => {
      if (spot.Identifiant === movingSpot.Identifiant) {
        return {
          ...movingSpot,
        };
      }
      return spot;
    });

  const { plan: [plan] = [] } = planUpdate.find(({ Name }) => Name === place) || {};

  return (
    <Box
      className={classes.root}
      onClick={handleMoveEnd}
      onPointerMove={handleMove}
    >
      <ActionBar />
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
                Spot={Spot}
                isSelected={selectedSpot.Identifiant === Spot.Identifiant && panelOpen}
                onClick={onSpotSelect}
                onMoveStart={handleMoveStart}
                onMoveEnd={handleMoveEnd}
                onMoveUndo={handleMoveUndo}
              />
            ))}
            {/* {ghostSpot && (
              <EditSpot
                key={ghostSpot.Identifiant}
                Spot={ghostSpot}
                isSelected={false}
                isGhost
                onMoveUndo={handleMoveUndo}
              />
            )} */}
          </Box>

        </TransformComponent>
      </TransformWrapper>
    </Box>
  );
}

export default React.memo(EditPlan);
