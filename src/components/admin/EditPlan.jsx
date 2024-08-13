import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import createPersistedState from 'use-persisted-state';
import usePlans from '../../hooks/usePlans';
import useSpots from '../../hooks/useSpots';
import EditSpot from './EditSpot';

const useStyles = makeStyles(theme => {
  const maxWidth = mq => `@media (max-width: ${theme.breakpoints.values[mq]}px)`;
  return {
    wrapper: {
      width: '100%',
      height: '100%',
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

const useUpdatedStack = createPersistedState('updateStack');

function EditPlan ({ handleClick, updatedSpot }) {
  const classes = useStyles();
  const { place } = useParams();
  const plans = usePlans();

  const defaultStack = plans
    .filter(({ Brouillon }) => !Brouillon)
    .reduce((acc, curr) => {
      const { Name } = curr;
      if (!Object.hasOwn(acc, Name)) {
        return {
          ...acc,
          [Name]: [],
        };
      }
      return acc;
    }, {});

  const [updateStack, setUpdatedStack] = useUpdatedStack({});

  useEffect(() => {
    if (!Object.keys(updateStack).length) {
      setUpdatedStack({
        ...defaultStack,
      });
    }
  }, [plans]);

  useEffect(() => {
    // Prevent adding an empty update on start
    if (Object.keys(updatedSpot).length) {
      setUpdatedStack({
        ...updateStack,
        [place]: [
          ...updateStack[place].filter(
            ({ Identifiant: spotId }, index) =>
              index !== updateStack[place].length - 1 || spotId !== updatedSpot.Identifiant,
          ),
          updatedSpot,
        ],
      });
    }
  }, [updatedSpot]);

  const spots = useSpots(place)
    .map(spot => {
      const idUpdateStack = updateStack[place]
        .map(({ Identifiant: spotId }) => spotId);
      if (idUpdateStack.includes(spot.Identifiant)) {
        return updateStack[place][idUpdateStack.lastIndexOf(spot.Identifiant)];
      }
      return spot;
    });

  const { plan: [plan] = [] } = plans.find(({ Name }) => Name === place) || {};
  const planRef = useRef(null);

  return (
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
            />
          ))}

        </Box>

      </TransformComponent>
    </TransformWrapper>
  );
}

export default React.memo(EditPlan);
