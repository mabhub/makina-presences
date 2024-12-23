import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import createPersistedState from 'use-persisted-state';

import { Alert, AlertTitle, Box, Snackbar, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { baseFlags, isEnable } from '../feature_flag_service';
import { sameLowC } from '../helpers';
import useAdditionals from '../hooks/useAdditionals';
import usePlans from '../hooks/usePlans';
import usePresences from '../hooks/usePresences';
import useSpots from '../hooks/useSpots';
import SpotAdditionals from './SpotAdditionals';
import SpotButton from './SpotButton';
import TriPresence from './TriPresence';

const { FF_COMPLEMENTARY } = baseFlags;

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
    marginLeft: theme.spacing(0.5),
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
  wheel: {
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

const useTriState = createPersistedState('tri');

const Plan = ({ edit }) => {
  const classes = useStyles();
  const [tri] = useTriState();

  const enableComplementary = isEnable(FF_COMPLEMENTARY);

  const plans = usePlans();
  const { place } = useParams();

  const spots = useSpots(place);
  const { plan: [plan] = [] } = plans.find(({ Name }) => Name === place) || {};

  const DragWrapper = edit ? Children : TransformWrapper;
  const DragComponent = edit ? Children : TransformComponent;

  const [snackBarInfo, setSnackBarInfo] = useState({
    showSnackBar: false,
    currentTri: '',
    currentSpot: '',
    conflict: false,
    isClosed: false,
  });
  const snackBarPosition = {
    vertical: 'top',
    horizontal: 'right',
  };

  const handleConflict = (value, t, spot) => {
    if (!snackBarInfo.showSnackBar && !snackBarInfo.isClosed) {
      setSnackBarInfo(previous => ({
        ...previous,
        showSnackBar: value,
        currentTri: t,
        currentSpot: spot,
        conflict: true,
      }));
    }
  };

  const { presences } = usePresences(place);
  const ownPresences = presences
    .filter(({ tri: t }) => sameLowC(tri, t))
    .reduce((acc, { day: d, ...presence }) => ({
      ...acc,
      [d]: [...(acc[d] || []), presence],
    }), {});

  const isCumulativeSpot = React.useCallback(
    spot => spots
      .filter(({ Cumul }) => Cumul)
      .some(({ Identifiant }) => Identifiant === spot),
    [spots],
  );

  const onlyParkingDay = Object.values(ownPresences)
    .filter(dayPresences => dayPresences.every(({ spot }) => isCumulativeSpot(spot)));
  useEffect(() => {
    if (onlyParkingDay.length && !snackBarInfo.showSnackBar && !snackBarInfo.isClosed) {
      setSnackBarInfo(previous => ({
        ...previous,
        showSnackBar: true,
        parking: true,
      }));
    }
  }, [ownPresences, isCumulativeSpot, snackBarInfo, onlyParkingDay]);

  const handleSnackbarClose = () => {
    setSnackBarInfo({
      ...snackBarInfo,
      showSnackBar: false,
      isClosed: true,
    });
  };

  const planRef = useRef(null);

  const additionals = useAdditionals(place);

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

            {spots.map(spot => (
              <SpotButton
                key={spot.Identifiant}
                spot={spot}
                onConflict={handleConflict}
              />
            ))}

            {enableComplementary && additionals
              .map(additional => (
                <SpotAdditionals
                  key={additional.Titre}
                  additional={additional}
                  plan={planRef}
                />
              ))}
          </Box>
        </DragComponent>
      </DragWrapper>
      <Snackbar
        open={snackBarInfo.showSnackBar}
        anchorOrigin={snackBarPosition}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
      >
        <Alert
          severity={snackBarInfo.conflict ? 'error' : 'warning'}
        >
          <AlertTitle><strong>Attention</strong></AlertTitle>
          <Box
            sx={{
              display: 'grid',
              gap: theme => (theme.spacing(1.5)),
            }}
          >
            {snackBarInfo.conflict && (
            <Box>
              Vous êtes inscris sur le même poste que
              <TriPresence
                tri={snackBarInfo.currentTri}
                alt
                className={classes.tri}
              />
              (<strong>{snackBarInfo.currentSpot}</strong>)
              <br />
              Discutez-en avec lui ou changez de poste.
            </Box>
            )}
            {snackBarInfo.parking && (
              <Box className={classes.sectionParking}>
                <Typography variant="body2">
                  Il y a des journées ou vous êtes uniquement inscris sur une place de parking.
                </Typography>
              </Box>
            )}
          </Box>
        </Alert>
      </Snackbar>
    </>
  );
};

export default React.memo(Plan);
