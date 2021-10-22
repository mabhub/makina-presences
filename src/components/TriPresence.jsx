import React from 'react';
import createPersistedState from 'use-persisted-state';

import { Chip } from '@mui/material';

import { sameLowC } from '../helpers';

const useTriState = createPersistedState('tri');

const TriPresence = ({ tri, alt, ...props }) => {
  const [ownTri] = useTriState();
  const color = alt ? 'secondary' : 'primary';
  const isOwnTri = sameLowC(ownTri, tri);

  return (
    <Chip
      size="small"
      label={tri}
      color={isOwnTri ? color : undefined}
      {...props}
    />
  );
};

export default React.memo(TriPresence);
