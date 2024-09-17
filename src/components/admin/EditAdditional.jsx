import React, { useState } from 'react';
import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Delete, Edit, OpenWith, Visibility } from '@mui/icons-material';
import clsx from 'clsx';
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

function EditAdditional ({ additional }) {
  const classes = useStyles();

  const { Fixe, x, y } = additional;

  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  const quickActions = [
    OpenWith,
    Edit,
    Delete,
  ];

  return (
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
      {open && quickActions.map((icon, index) => {
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
  );
}

export default React.memo(EditAdditional);
