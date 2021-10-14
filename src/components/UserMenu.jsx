import React from 'react';
import createPersistedState from 'use-persisted-state';

import { Link } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useTriState = createPersistedState('tri');

const useStyles = makeStyles(() => ({
  root: {
    cursor: 'pointer',
  },
}));

const UserMenu = () => {
  const [tri, setTri] = useTriState();

  const classes = useStyles();

  return (
    <Link
      className={classes.root}
      onClick={() => setTri('')}
    >
      {tri} (changer)
    </Link>
  );
};

export default UserMenu;
