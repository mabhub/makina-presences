import React from 'react';
import createPersistedState from 'use-persisted-state';

import { Chip } from '@material-ui/core';

import { sameLowC } from '../helpers';
import { UnsubscribeIcon } from './SubscriptionIcon';

const useTriState = createPersistedState('tri');

const TriPresence = ({
  tri,
  alt,
  // onDelete,
  ...props
}) => {
  const [ownTri, setTri] = useTriState();
  const color = alt ? 'secondary' : 'primary';
  const isOwnTri = sameLowC(ownTri, tri);

  return (
    <Chip
      size="small"
      label={tri}
      color={isOwnTri ? color : undefined}
      onClick={!isOwnTri ? () => setTri(tri) : undefined}
      deleteIcon={(
        <UnsubscribeIcon outline={false} />
      )}
      // onDelete={isOwnTri ? onDelete : undefined}
      {...props}
    />
  );
};

export default React.memo(TriPresence);
