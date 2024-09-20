import { Delete, Edit, OpenWith } from '@mui/icons-material';
import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import createPersistedState from 'use-persisted-state';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import AdditionalsDialog from './AdditionalsDialog';
import AdditionalsPopup from './AdditionalsPopup';
import { DELETED_KEY } from './const';

const useStyles = makeStyles(theme => ({
  root: {
    zIndex: 2,
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
  },

  quickActions: {
    position: 'absolute',
    top: '-100%',
    left: '-100%',
  },
  quickActionButton: {
    width: 20,
    height: 20,
    position: 'absolute',
    border: '1px solid #00000030',
    borderRadius: '100%',
    background: 'white',
    padding: theme.spacing(0.3),
    display: 'grid',
    zIndex: 3,
    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      cursor: 'pointer',
      borderColor: theme.palette.primary.main,
    },
  },
  fixedQuickActionButton: {
    top: 0,
    right: '-22px',
  },
  popupQuickActionButton: {
    top: 'calc(50% - 10px)',
  },
  quickActionIcon: {
    width: '100%',
    height: '100%',
  },
}));

const useUpdateStack = createPersistedState('updateStack');
const useUndidStack = createPersistedState('undidStack');
const useMapping = createPersistedState('mapping');

const EditAdditional = forwardRef((
  {
    additional,
    onSelect = () => {},
    isSelected = false,
    planRef,
    updatePlanState = () => {},
    planState,
  },
  ref,
) => {
  const classes = useStyles();
  const [updateStack, setUpdateStack] = useUpdateStack();
  const [undidStack, setUndidStack] = useUndidStack();
  const [mapping] = useMapping();
  const { place } = useParams();
  const placeID = mapping[place];

  const { id, Fixe, x, y } = additional;

  const [edit, setEdit] = useState(false);

  const resestUndidStack = () => {
    setUndidStack({
      ...undidStack,
      [placeID]: [],
    });
  };

  const handleEdit = editedAdditional => {
    setEdit(!edit);
    if (editedAdditional) {
      resestUndidStack();
      setUpdateStack({
        ...updateStack,
        [placeID]: [
          ...updateStack[placeID],
          editedAdditional,
        ],
      });
      onSelect(editedAdditional);
    }
  };

  const handleDelete = () => {
    resestUndidStack();
    setUpdateStack({
      ...updateStack,
      [placeID]: [
        ...updateStack[placeID],
        {
          ...additional,
          [DELETED_KEY]: true,
        },
      ],
    });
  };

  const [isMoving, setIsMoving] = useState(false);
  const [deltas, setDeltas] = useState({
    x: 0,
    y: 0,
  });
  const [coords, setCoords] = useState({ x, y });
  useEffect(() => {
    setCoords({ x, y });
  }, [x, y]);

  const getPositionAtCenter = element => {
    const { top, left, width, height } = element.getBoundingClientRect();
    return {
      x: left + width / 2,
      y: top + height / 2,
    };
  };

  const handleMoveStart = event => {
    event.stopPropagation();

    const { current: { state: { scale } = {} } = {} } = planRef;
    const clicPosition = getPositionAtCenter(document.getElementById(`additional-${id}`));
    setDeltas({
      x: clicPosition.x - (coords.x * scale),
      y: clicPosition.y - (coords.y * scale),
    });
    updatePlanState(true);
  };

  useEffect(() => {
    if (isSelected) {
      setIsMoving(planState);
    }
  }, [planState, isSelected]);

  const snap = (v, a = 5) => Math.round(v / a) * a;
  const getNewPosition = event => {
    const { current: { state: { scale } = {} } = {} } = planRef;
    return {
      x: snap((event.clientX - deltas.x) / scale),
      y: snap((event.clientY - deltas.y) / scale),
    };
  };

  const popupRef = useRef(null);

  useImperativeHandle(ref, () => {
    if (isMoving) {
      return {
        handleMove (event) {
          popupRef.current.focus();
          setCoords({
            ...getNewPosition(event),
          });
        },
      };
    }
    return undefined;
  });

  const handleMoveEnd = event => {
    resestUndidStack();
    setUpdateStack({
      ...updateStack,
      [placeID]: [
        ...updateStack[placeID],
        {
          ...additional,
          ...getNewPosition(event),
        },
      ],
    });
    updatePlanState(false);
  };

  const quickActions = [
    { icon: OpenWith, method: handleMoveStart },
    { icon: Edit, method: handleEdit },
    { icon: Delete, method: handleDelete },
  ];

  const handleClick = event => {
    onSelect(additional);
    if (isMoving) {
      setIsMoving(!isMoving);
      handleMoveEnd(event);
    }
  };

  const handleMoveUndo = () => {
    if (isMoving) {
      setCoords({ x, y });
      updatePlanState(false);
    }
  };

  return (
    <>
      <Box
        className={classes.root}
        style={{
          left: `${coords.x}px`,
          top: `${coords.y}px`,
        }}
      >
        <div id={`additional-${id}`}>
          <AdditionalsPopup
            info={additional}
            mounted
            onClick={handleClick}
            isSelected={isSelected}
            cancelMoving={handleMoveUndo}
            popupRef={popupRef}
          />
        </div>
        {isSelected && (!isMoving) && quickActions.map(({ icon, method }, index) => {
          const key = `icon-${index}`;
          const Icon = icon;
          return (
            <Box
              key={key}
              component="button"
              className={clsx({
                [classes.quickActionButton]: true,
                [classes.fixedQuickActionButton]: Fixe,
                [classes.popupQuickActionButton]: !Fixe,
              })}
              sx={{
                transform: Fixe
                  ? `translateY(${index * 22}px)`
                  : `
                  rotate(-${index * 60}deg)
                  translateX(-22px)
                `,
              }}
              onClick={event => method(event)}
            >
              <Icon
                className={classes.quickActionIcon}
                sx={{
                  transform: Fixe ? '' : `rotate(${index * 60}deg)`,
                }}
              />
            </Box>
          );
        })}
      </Box>
      {edit && (
        <AdditionalsDialog
          open={edit}
          onClose={handleEdit}
          baseInfo={additional}
        />
      )}
      {isMoving && (
      <AdditionalsPopup
        info={additional}
        mounted
        isSelected={isSelected}
        isGhost
      />
      )}
    </>
  );
});

export default React.memo(EditAdditional);
