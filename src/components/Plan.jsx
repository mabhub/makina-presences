import React, { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import { Alert, AlertTitle, Box, Snackbar } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import usePlans from '../hooks/usePlans';
import useSpots from '../hooks/useSpots';
import SpotButton from './SpotButton';
import TriPresence from './TriPresence';
import useMapping from '../hooks/useMapping';

const { VITE_TABLE_ID_SPOTS: spotsTableId } = import.meta.env;

const useStyles = makeStyles(theme => ({
  wrapper: {
    width: '100%',
    height: '100%',
  },
  content: {
  },
  planWrapper: {
    position: 'relative',
  },
  plan: {
    filter: theme.palette.mode === 'dark' ? 'invert(100%)' : 'invert(0%)',
  },
  tri: {
    marginRight: theme.spacing(0.5),
    height: theme.spacing(2.5),
    '& .MuiChip-label': {
      padding: theme.spacing(0.5, 1, 0.5, 1),
    },
  },
}));

const transformWrapperProps = {
  minScale: 0.25,
  panning: {
    velocityDisabled: true,
    excluded: ['MuiButtonBase-root'],
  },
  doubleClick: { disabled: true },
  zoomAnimation: { disabled: true },
  alignmentAnimation: { disabled: true },
  velocityAnimation: { disabled: true },
};

export const createSpot = async e => {
  const { VITE_BASEROW_TOKEN: token } = import.meta.env;
  const rect = e.target.getBoundingClientRect();
  await fetch(
    `https://api.baserow.io/api/database/rows/table/${spotsTableId}/?user_field_names=true`,
    {
      method: 'POST',
      headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Identifiant: 'PX',
        x: Math.round((e.clientX - rect.left) / 5) * 5,
        y: Math.round((e.clientY - rect.top) / 5) * 5,
      }),
    },
  );
};

const Children = ({ children }) => children;

const Plan = ({ edit }) => {
  const classes = useStyles();

  const plans = usePlans();
  const { place } = useParams();

  const mapping = useMapping();
  const spots = useSpots(mapping[place]);
  const { plan: [plan] = [] } = plans.find(({ Name }) => Name === place) || {};

  const DragWrapper = edit ? Children : TransformWrapper;
  const DragComponent = edit ? Children : TransformComponent;

  const [snackBarInfo, setSnackBarInfo] = useState({
    showSnackBar: false,
    currentTri: '',
    currentSpot: '',
  });
  const snackBarPosition = {
    vertical: 'top',
    horizontal: 'left',
  };

  const handleConflict = (value, tri, spot) => {
    setSnackBarInfo({
      showSnackBar: value,
      currentTri: tri,
      currentSpot: spot,
    });
  };

  const planRef = useRef(null);

  return (
    <>
      <DragWrapper
        {...transformWrapperProps}
        ref={planRef}
      >
        <DragComponent
          wrapperClass={classes.wrapper}
          contentClass={classes.content}
        >
          <Box
            className={classes.planWrapper}
            id="box"
          >
            {plan?.url && (
            <img
              src={plan.url}
              alt=""
              className={classes.plan}
              id={place}
              onLoad={() => {
                planRef.current.zoomToElement(place);
              }}
            />
            )}

            {spots.map(Spot => (
              <SpotButton
                key={Spot.Identifiant}
                Spot={Spot}
                onConflict={handleConflict}
              />
            ))}
          </Box>
        </DragComponent>
      </DragWrapper>
      <Snackbar
        open={snackBarInfo.showSnackBar}
        anchorOrigin={snackBarPosition}
      >
        <Alert
          severity="error"
          onClose={() => (setSnackBarInfo({
            ...snackBarInfo,
            showSnackBar: !snackBarInfo.showSnackBar,
          }))}
        >
          <AlertTitle><strong>Veuillez changer de poste.</strong></AlertTitle>
          <TriPresence
            tri={snackBarInfo.currentTri}
            alt
            className={classes.tri}
          />
          vient de réserver <strong>{snackBarInfo.currentSpot}</strong> juste avant vous !
        </Alert>
      </Snackbar>
    </>
  );
};

export default React.memo(Plan);
