import React from 'react';
import { IconButton } from '@material-ui/core';

import { SubscribeIcon, UnsubscribeIcon } from './SubscriptionIcon';

const DayPresenceButton = React.memo(({
  unsub,
  setPresence,
  tri,
  date,
  ...props
}) => (
  <IconButton
    onClick={() => setPresence({ tri, date })}
    {...props}
  >
    {unsub ? <UnsubscribeIcon /> : <SubscribeIcon />}
  </IconButton>
));

export default DayPresenceButton;
