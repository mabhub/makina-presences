import { Menu, MenuItem, Typography } from '@mui/material';
import React, { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(10),
  },
  title: {
    fontSize: '16px',
    paddingRight: theme.spacing(6),
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(1.2),
  },
  actions: {
    fontSize: '12px',
    width: '100%',
  },
}));

const ContextualMenu = ({ anchor, title, items }) => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState(anchor);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = action => {
    action();
    handleClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleClose}
      className={classes.root}
      MenuListProps={{ sx: { py: 0.5 } }}
    >
      {title && (<Typography className={classes.title}>{title}</Typography>)}
      {items.map(({ item, action }) => (
        <MenuItem
          key={item}
          className={classes.actions}
          onClick={() => { handleClick(action); }}
          component="button"
        >{item}
        </MenuItem>
      ))}
    </Menu>
  );
};

export default React.memo(ContextualMenu);
