import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import createPersistedState from 'use-persisted-state';
import usePlans from '../../hooks/usePlans';
import useSpots from '../../hooks/useSpots';
import ActionBar from './ActionBar';
import EditSpot from './EditSpot';
import { DELETED_KEY } from './SpotPanel';
import { CREATED_KEY } from './NewSpotDialog';

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
    // border: '1px solid red',
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

function EditPlan ({ handleClick, updatedSpot, selectedSpot, panelOpen }) {
  const classes = useStyles();
  const { place } = useParams();

  const [planUpdate] = usePlanUpdate();

  const plans = usePlans().concat(planUpdate);

  // console.log(plans);

  const [updateStack, setUpdatedStack] = useUpdatedStack({});

  const keepSpotUpdate = (spot, index) => {
    const { Identifiant: spotId } = spot;
    // Is not the last one
    if (index !== updateStack[place].length - 1) return true;

    // Is the last, ID is different from the new update
    if (spotId !== updatedSpot.Identifiant) return true;

    // Is the last, IDs are the same, and the spot was created last action
    const isCreated = Object.hasOwn(spot, CREATED_KEY)
      && updateStack[place].findIndex(
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
    // Prevent adding an empty update on start
    if (Object.keys(updatedSpot).length) {
      setUpdatedStack({
        ...updateStack,
        [place]: [
          ...updateStack[place].filter((spot, index) => keepSpotUpdate(spot, index)),
          updatedSpot,
        ],
      });
    }
  }, [updatedSpot]);

  const idUpdateStack = updateStack[place].map(({ Identifiant: spotId }) => spotId);
  const spots = useSpots(place)
    // add created spot
    .concat([...new Set(
      updateStack[place]
        .filter(spot => Object.hasOwn(spot, CREATED_KEY))
        .map(({ Identifiant }) => Identifiant),
    )].map(Identifiant => updateStack[place][
      updateStack[place].findLastIndex(({ Identifiant: spotId }) => spotId === Identifiant)
    ]))
    // remove deleted spot
    .filter(spot => {
      if (idUpdateStack.includes(spot.Identifiant)
        && Object.hasOwn(
          updateStack[place][idUpdateStack.lastIndexOf(spot.Identifiant)], DELETED_KEY,
        )) {
        return false;
      }
      return true;
    })
    // update updated spot
    .map(spot => {
      if (idUpdateStack.includes(spot.Identifiant)) {
        return updateStack[place][idUpdateStack.lastIndexOf(spot.Identifiant)];
      }
      return spot;
    });

  const { plan: [plan] = [] } = plans.find(({ Name }) => Name === place) || {};

  // console.log(plan);
  const planRef = useRef(null);

  return (
    <Box className={classes.root}>
      <ActionBar />
      <TransformWrapper
        ref={planRef}
        disabled
      >
        <TransformComponent
          wrapperClass={classes.wrapper}
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
                onClick={handleClick}
                isSelected={selectedSpot.Identifiant === Spot.Identifiant && panelOpen}
              />
            ))}

          </Box>

        </TransformComponent>
      </TransformWrapper>
    </Box>
  );
}

export default React.memo(EditPlan);
