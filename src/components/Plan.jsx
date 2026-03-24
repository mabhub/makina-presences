import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { baseFlags, isEnable } from '../feature_flag_service';
import { sameLowC, isCumulativeSpot } from '../helpers';
import useAdditionals from '../hooks/useAdditionals';
import usePlan from '../hooks/usePlan';
import usePresences from '../hooks/usePresences';
import useSpots from '../hooks/useSpots';
import SpotAdditionals from './SpotAdditionals';
import SpotButton from './SpotButton';
import { useTriState } from '../hooks/usePersistedStates';

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
  const { place } = useParams();

  const currentPlan = usePlan({ Name: place });
  const {
    plan: [planPicture] = [], // Get the plan image matching the place param
    uuid: currentPlanUuid, // Get plan UUID for fetching spots
  } = currentPlan || {};

  const spots = useSpots(currentPlanUuid);
  const additionals = useAdditionals(place);

  const { presences } = usePresences(place);

  // Choose wrapper/component depending on edit mode
  const DragWrapper = edit ? Children : TransformWrapper;
  const DragComponent = edit ? Children : TransformComponent;

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

  // Show toast if only parking
  useEffect(() => {
    if (onlyParkingDay.length) {
      toast.warning('Il y a des journées où vous êtes uniquement inscrit sur une place de parking.');
    }
  }, [onlyParkingDay.length]);

  // Handle conflict notification via toast
  const handleConflict = (value, t, spot) => {
    if (value) {
      toast.error(`Vous êtes inscrit sur le même poste que ${t} (${spot}). Discutez-en ou changez de poste.`);
    }
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
            {planPicture?.url && (
              <img
                src={planPicture.url}
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
    </>
  );
};

export default React.memo(Plan);
