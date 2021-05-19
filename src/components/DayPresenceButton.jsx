import React from 'react';
import createPersistedState from 'use-persisted-state';
import { IconButton } from '@material-ui/core';

import { SubscribeIcon, UnsubscribeIcon } from './SubscriptionIcon';
import PresenceContext from './PresenceContext';

const useTriState = createPersistedState('tri');

const DayPresenceButton = React.memo(({
  unsub,
  date,
  userPresence,
  ...props
}) => {
  const [tri] = useTriState();
  const setPresence = React.useContext(PresenceContext);
  const handleClick = React.useCallback(
    () => setPresence({ tri, date, userPresence }),
    [tri, date, userPresence, setPresence],
  );

  return (
    <IconButton onClick={handleClick} {...props}>
      {unsub ? <UnsubscribeIcon /> : <SubscribeIcon />}
    </IconButton>
  );
});

export default React.memo(DayPresenceButton);
