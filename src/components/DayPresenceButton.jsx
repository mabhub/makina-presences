import React from 'react';
import createPersistedState from 'use-persisted-state';
import { IconButton } from '@material-ui/core';

import { UnsubscribeIcon } from './SubscriptionIcon';
import PresenceContext from './PresenceContext';

const useTriState = createPersistedState('tri');

const DayPresenceButton = React.memo(({
  date,
  ...props
}) => {
  const [tri] = useTriState();
  const setPresence = React.useContext(PresenceContext);
  const handleClick = React.useCallback(
    () => setPresence({ tri, date }),
    [tri, date, setPresence],
  );

  return (
    <IconButton onClick={handleClick} {...props}>
      <UnsubscribeIcon />
    </IconButton>
  );
});

export default React.memo(DayPresenceButton);
