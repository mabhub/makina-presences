import React from 'react';
import clsx from 'clsx';
import createPersistedState from 'use-persisted-state';

import { Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { sameLowC } from '../helpers';

const useTriState = createPersistedState('tri');

const TriPresence = ({ tri, alt, className, ...props }) => {
  const [ownTri] = useTriState();
  const [hl, setHl] = React.useState(false);
  const color = alt ? 'secondary' : 'primary';
  const isOwnTri = sameLowC(ownTri, tri);
  const theme = useTheme();

  return (
    <>
      <Chip
        size="small"
        label={tri}
        color={isOwnTri ? color : undefined}
        className={clsx(`hl-${tri}`, className)}
        onMouseEnter={() => setHl(true)}
        onMouseLeave={() => setHl(false)}
        {...props}
      />

      {hl && !isOwnTri && (
        <style>
          {`
          .hl-${tri} {
            background-color: ${theme.palette.secondary.main};
            color:  ${theme.palette.secondary.contrastText};
          }
          `}
        </style>
      )}
    </>
  );
};

export default React.memo(TriPresence);
