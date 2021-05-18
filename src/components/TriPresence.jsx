import React from 'react';
import createPersistedState from 'use-persisted-state';

import { Chip, Tooltip } from '@material-ui/core';

import { sameLowC } from '../helpers';
import { tooltipOptions } from '../settings';
import { UnsubscribeIcon } from './SubscriptionIcon';

const useTriState = createPersistedState('tri');

const TriPresence = ({
  tri,
  alt,
  momentLabel: label,
  onDelete,
  ...props
}) => {
  const [ownTri, setTri] = useTriState();
  const color = alt ? 'secondary' : 'primary';
  const isOwnTri = sameLowC(ownTri, tri);

  return (
    <Tooltip
      {...tooltipOptions}
      title={isOwnTri ? '' : 'Utiliser ce trigramme'}
    >
      <Chip
        size="small"
        label={tri}
        color={isOwnTri ? color : undefined}
        onClick={!isOwnTri ? () => setTri(tri) : undefined}
        deleteIcon={(
          <UnsubscribeIcon outline={false} when={label} />
        )}
        onDelete={isOwnTri ? onDelete : undefined}
        {...props}
      />
    </Tooltip>
  );
};

export default React.memo(TriPresence);
