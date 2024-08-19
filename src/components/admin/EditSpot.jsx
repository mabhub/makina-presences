import { Fab } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React from 'react';

const useStyles = makeStyles(theme => ({
  spot: {
    width: 35,
    minWidth: 35,
    height: 35,
    minHeight: 35,
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    border: '2px solid transparent',
    backgroundColor: theme.palette.primary.bg,
    color: theme.palette.primary.fg,
    textTransform: 'none',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    fontSize: '0.75em',
  },
  selected: {
    backgroundImage: 'linear-gradient(45deg, #ffffff 20%, #e6e6e6 20%, #e6e6e6 50%, #ffffff 50%, #ffffff 70%, #e6e6e6 70%, #e6e6e6 100%)',
    backgroundSize: '7.07px 7.07px',
    color: 'black',
    fontWeight: 'bold',
  },
}));

function EditSpot ({ Spot, onClick = () => {}, isSelected }) {
  const classes = useStyles();

  const { Identifiant: spotId, x, y, Type } = spot;

  const handleClick = () => {
    onClick(Spot);
  };

  return (
    <Fab
      className={clsx({
        [classes.spot]: true,
        [classes.selected]: isSelected,
      })}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        borderColor: Type?.color?.replace('-', ''),
      }}
      component="button"
      size="small"
      onClick={handleClick}
    >
      {spotId}
    </Fab>
  );
}

export default React.memo(EditSpot);
