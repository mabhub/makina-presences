import React from 'react';
import { IconButton } from '@material-ui/core';

import { SubscribeIcon, UnsubscribeIcon } from './SubscriptionIcon';
import PresenceContext from './PresenceContext';

const DayPresenceButton = React.memo(({
  unsub,
  tri,
  date,
  userPresence,
  ...props
}) => {
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

export default DayPresenceButton;
