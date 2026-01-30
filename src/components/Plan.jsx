import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import createPersistedState from 'use-persisted-state';

import { Alert, AlertTitle, Box, Snackbar, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { baseFlags, isEnable } from '../feature_flag_service';
import { sameLowC, isCumulativeSpot } from '../helpers';
import useAdditionals from '../hooks/useAdditionals';
import usePlans from '../hooks/usePlans';
import usePresences from '../hooks/usePresences';
import useSpots from '../hooks/useSpots';
import SpotAdditionals from './SpotAdditionals';
import SpotButton from './SpotButton';
import TriPresence from './TriPresence';

const { FF_COMPLEMENTARY } = baseFlags;

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

const Children = ({ children }) => children;

const useTriState = createPersistedState('tri');

/**
 * Plan component: displays the interactive plan with spots and additionals.
 * - Handles zoom/pan (read-only) or drag (edit mode).
 * - Shows a snackbar for conflicts or parking-only days.
 * - Delegates spot rendering to SpotButton and SpotAdditionals.
 *
 * @param {Object} props
 * @param {boolean} props.edit - If true, enables edit mode (drag only).
 * @returns {JSX.Element}
 */
const Plan = ({ edit }) => {
  const classes = useStyles();
  const [tri] = useTriState();

  // Feature flag for complementary spots
  const enableComplementary = isEnable(FF_COMPLEMENTARY);

  // Data hooks
  const plans = usePlans();
  const { place } = useParams();

  const spots = useSpots(place);
  const { plan: [plan] = [] } = plans.find(({ Name }) => Name === place) || {};
  const additionals = useAdditionals(place);
  const { presences } = usePresences(place);

  // Choose wrapper/component depending on edit mode
  const DragWrapper = edit ? Children : TransformWrapper;
  const DragComponent = edit ? Children : TransformComponent;

  // State for snackbar info
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

  // Utility: check if a spot is cumulative (parking)
  const isCumulativeSpotCb = React.useCallback(
    spot => isCumulativeSpot(spot, spots),
    [spots],
  );

  // Compute own presences by day
  const ownPresences = React.useMemo(() => (
    presences
      .filter(({ tri: t }) => sameLowC(tri, t))
      .reduce((acc, { day: d, ...presence }) => ({
        ...acc,
        [d]: [...(acc[d] || []), presence],
      }), {})
  ), [presences, tri]);

  // Detect days where user is only on parking spots
  const onlyParkingDay = React.useMemo(
    () =>
      Object.values(ownPresences)
        .filter(dayPresences => dayPresences.every(({ spot }) => isCumulativeSpotCb(spot))),
    [ownPresences, isCumulativeSpotCb],
  );

  // Show snackbar if only parking or conflict
  useEffect(() => {
    if (onlyParkingDay.length && !snackBarInfo.showSnackBar && !snackBarInfo.isClosed) {
      setSnackBarInfo(previous => ({
        ...previous,
        showSnackBar: true,
        parking: true,
      }));
    }
  }, [onlyParkingDay, snackBarInfo.showSnackBar, snackBarInfo.isClosed]);

  // Handle conflict notification
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

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackBarInfo({
      ...snackBarInfo,
      showSnackBar: false,
      isClosed: true,
    });
  };

  // Ref for plan zoom/pan
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
            {/* Plan image */}
            {plan?.url && (
              <img
                src={plan.url}
                alt=""
                className={classes.plan}
                id={place}
                onLoad={() => {
                  if (planRef.current?.zoomToElement) {
                    planRef.current.zoomToElement(place);
                  }
                }}
              />
            )}

            {/* Spots */}
            {spots.map(spot => (
              <SpotButton
                key={spot.Identifiant}
                spot={spot}
                edit={edit}
                onConflict={handleConflict}
              />
            ))}

            {/* Additionals (complementary spots) */}
            {enableComplementary && additionals.map(additional => (
              <SpotAdditionals
                key={additional.Titre}
                additional={additional}
                plan={planRef}
              />
            ))}
          </Box>
        </DragComponent>
      </DragWrapper>
      {/* Snackbar for conflicts or parking-only days */}
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
                  Il y a des journées où vous êtes uniquement inscrit sur une place de parking.
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
