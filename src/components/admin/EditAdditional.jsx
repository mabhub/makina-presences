import { Delete, Edit, OpenWith } from '@mui/icons-material';
import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { useState } from 'react';
import createPersistedState from 'use-persisted-state';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import AdditionalsDialog from './AdditionalsDialog';
import AdditionalsPopup from './AdditionalsPopup';

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

function EditAdditional ({ additional, onSelect = () => {}, isSelected = false }) {
  const classes = useStyles();
  const [updateStack, setUpdateStack] = useUpdateStack();
  const [undidStack, setUndidStack] = useUndidStack();
  const [mapping] = useMapping();
  const { place } = useParams();
  const placeID = mapping[place];

  const { Fixe, x, y } = additional;

  // const [selected, setIsSelected] = useState(isSelected);
  const [edit, setEdit] = useState(false);

  const handleClick = () => {
    // setIsSelected(!selected);
    onSelect(additional);
  };

  const handleEdit = editedAdditional => {
    setEdit(!edit);
    if (editedAdditional) {
      setUndidStack({
        ...undidStack,
        [placeID]: [],
      });
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

  const quickActions = [
    { icon: OpenWith, method: () => {} },
    { icon: Edit, method: handleEdit },
    { icon: Delete, method: () => {} },
  ];

  return (
    <>
      <Box
        className={classes.root}
        style={{
          left: `${x}px`,
          top: `${y}px`,
        }}
      >
        <AdditionalsPopup
          info={additional}
          mounted
          onClick={handleClick}
        />
        {isSelected && quickActions.map(({ icon, method }, index) => {
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
              onClick={() => method()}
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
    </>
  );
}

export default React.memo(EditAdditional);
