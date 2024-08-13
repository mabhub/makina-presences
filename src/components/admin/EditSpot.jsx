import { Fab } from '@mui/material';
import createPersistedState from 'use-persisted-state';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect } from 'react';

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
}));

// const useUpdatedSpot = createPersistedState('updatedSpot');

function EditSpot ({ Spot, onClick = () => {} }) {
  const classes = useStyles();
  // const [updatedSpot] = useUpdatedSpot({});

  const { Identifiant: spotId, x, y, Type, Description, Cumul } = Spot;

  const handleClick = () => {
    onClick(Spot);
  };

  // if (updatedSpot.Identifiant === spotId && JSON.stringify(updatedSpot) !== JSON.stringify(Spot)) {
  //   console.log(spotId, ' changed');
  //   // console.log(Spot);
  //   // console.log(JSON.stringify(updatedSpot) !== JSON.stringify(Spot));
  //   // updatedSpot.map((key, value) => console.log(key, value));
  //   // Object.keys(updatedSpot).map(key => Spot[key] = updatedSpot[key]);
  //   // x = 85;
  // }

  return (
    <Fab
      className={classes.spot}
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
