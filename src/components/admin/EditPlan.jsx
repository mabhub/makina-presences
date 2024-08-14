import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import createPersistedState from 'use-persisted-state';
import usePlans from '../../hooks/usePlans';
import useSpots from '../../hooks/useSpots';
import EditSpot from './EditSpot';
import ActionBar from './ActionBar';

const useStyles = makeStyles(theme => {
  const maxWidth = mq => `@media (max-width: ${theme.breakpoints.values[mq]}px)`;
  return {
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
      backgroundImage: 'linear-gradient(to right, #f5f5f5 1px, transparent 1px), linear-gradient(to bottom, #f5f5f5 1px, transparent 1px)',
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
  };
});

const useUpdateStack = createPersistedState('updateStack');

function EditPlan ({ handleClick, updatedSpot, selectedSpot, panelOpen }) {
  const classes = useStyles();
  const { place } = useParams();
  const plans = usePlans();

  const [updateStack, setUpdateStack] = useUpdateStack({});

  const keepSpotUpdate = (spot, index) => {
    const { Identifiant: spotId } = spot;
    // Is not the last one
    if (index !== updateStack[place].length - 1) return true;

    // Is the last, ID is different from the new update
    if (spotId !== updatedSpot.Identifiant) return true;

    // Is the last, IDs are the same and last update isn't position related
    const [diff] = Object.keys(spot).filter(k => spot[k] !== updatedSpot[k]);
    console.log(diff, diff !== 'x', diff !== 'y');
    if (diff !== 'x' && diff !== 'y') return true;

    return false;
  };

  useEffect(() => {
    // Prevent adding an empty update on start
    if (Object.keys(updatedSpot).length) {
      setUpdateStack({
        ...updateStack,
        [place]: [
          ...updateStack[place].filter((spot, index) => keepSpotUpdate(spot, index)),
          updatedSpot,
        ],
      });
    }
  }, [updatedSpot]);

  const spots = useSpots(place)
    .map(spot => {
      const idUpdateStack = updateStack[place].map(({ Identifiant: spotId }) => spotId);
      if (idUpdateStack.includes(spot.Identifiant)) {
        return updateStack[place][idUpdateStack.lastIndexOf(spot.Identifiant)];
      }
      return spot;
    });

  const { plan: [plan] = [] } = plans.find(({ Name }) => Name === place) || {};
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
                spot={Spot}
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
