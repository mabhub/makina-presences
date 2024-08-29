import { ContentCopy, Delete, OpenWith } from '@mui/icons-material';
import { Box, Fab } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React from 'react';

const useStyles = makeStyles(theme => ({
  root: {
    width: 35,
    minWidth: 35,
    height: 35,
    minHeight: 35,
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
  },
  spot: {
    width: '100%',
    height: '100%',
    border: '2px solid transparent',
    backgroundColor: theme.palette.primary.bg,
    color: theme.palette.primary.fg,
    textTransform: 'none',
    whiteSpace: 'nowrap',
    textOverflow: 'clip',
    overflow: 'hidden',
    fontSize: '0.75em',
  },
  selected: {
    backgroundImage: 'linear-gradient(45deg, #ffffff 20%, #e6e6e6 20%, #e6e6e6 50%, #ffffff 50%, #ffffff 70%, #e6e6e6 70%, #e6e6e6 100%)',
    backgroundSize: '7.07px 7.07px',
    color: 'black',
    fontWeight: 'bold',
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
    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  move: {
    top: '-30%',
    right: '-40%',
  },
  duplicate: {
    top: '25%',
    right: '-60%',
    // transform: 'translateY(10px)',
  },
  delete: {
    top: '80%',
    right: '-40%',
  },
  quickActionIcon: {
    width: '100%',
    height: '100%',
    borderRadius: '100%',
  },
  test: {
    width: 35,
    height: 35,
  },
}));

function EditSpot ({ Spot, onClick = () => {}, isSelected, onMoveStart }) {
  const classes = useStyles();

  const { Identifiant: spotId, x, y, Type } = spot;

  const getPositionAtCenter = element => {
    const { top, left, width, height } = element.getBoundingClientRect();
    return {
      x: left + width / 2,
      y: top + height / 2,
    };
  };

  const handleClick = event => {
    event.stopPropagation();
    onClick(Spot);
  };

  const handleMoveStart = event => {
    event.stopPropagation();
    onMoveStart(
      getPositionAtCenter(document.getElementById(`btn-${spotId}`)),
      Spot,
    );
  };

  return (
    <Box
      className={classes.root}
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <div id={`btn-${spotId}`}>
        <Fab
          className={clsx({
            [classes.spot]: true,
            [classes.selected]: isSelected,
          })}
          style={{
            borderColor: Type?.color?.replace('-', ''),
          }}
          component="button"
          size="small"
          onClick={handleClick}
        >
          {spotId}

        </Fab>
      </div>
      {isSelected && (
        <>
          <Box
            component="button"
            onClick={handleMoveStart}
            className={clsx([classes.quickActionButton], [classes.move])}
          >
            <OpenWith className={classes.quickActionIcon} />
          </Box>
          <Box
            component="button"
            className={clsx([classes.quickActionButton], [classes.duplicate])}
          >
            <ContentCopy className={classes.quickActionIcon} />
          </Box>
          <Box
            component="button"
            className={clsx([classes.quickActionButton], [classes.delete])}
          >
            <Delete className={classes.quickActionIcon} />
          </Box>

        </>
      )}
    </Box>
  );
}

export default React.memo(EditSpot);
