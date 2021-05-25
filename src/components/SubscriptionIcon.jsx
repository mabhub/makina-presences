import React from 'react';
import { Tooltip } from '@material-ui/core';
import {
  RemoveCircle,
  RemoveCircleOutline,
  AddCircle,
  AddCircleOutline,
} from '@material-ui/icons';

import { tooltipOptions } from '../settings';

export const SubscribeIcon = React.memo(({ when, outline = true, ...props }) => (
  <Tooltip
    title={(
      <>
        <strong>S'inscrire</strong><br />
        {when ? `(${when} uniquement)` : '(journée entière)'}
      </>
    )}
    {...tooltipOptions}
    {...props}
  >
    {outline
      ? <AddCircleOutline />
      : <AddCircle />}
  </Tooltip>
));

export const UnsubscribeIcon = React.memo(({ when, outline = true, ...props }) => (
  <Tooltip
    title={(
      <>
        <strong>Se désinscrire</strong><br />
        {when ? `(${when} uniquement)` : '(journée entière)'}
      </>
    )}
    {...tooltipOptions}
    {...props}
  >
    {outline
      ? <RemoveCircleOutline />
      : <RemoveCircle />}
  </Tooltip>
));
