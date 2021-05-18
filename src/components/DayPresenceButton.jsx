import React from 'react';
import { IconButton } from '@material-ui/core';

import { SubscribeIcon, UnsubscribeIcon } from './SubscriptionIcon';

const DayPresenceButton = React.memo(({
  unsub,
  setPresence,
  tri,
  date,
  userPresence,
  ...props
}) => (
  <IconButton
    onClick={() => setPresence({ tri, date, userPresence })}
    {...props}
  >
    {unsub ? <UnsubscribeIcon /> : <SubscribeIcon />}
  </IconButton>
));

export default DayPresenceButton;
