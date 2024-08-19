import React from 'react';
import clsx from 'clsx';
import createPersistedState from 'use-persisted-state';

import { Avatar, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';

import { AFTERNOON_PERIOD, MORNING_PERIOD } from './SpotButton';
import { sameLowC } from '../helpers';

const useTriState = createPersistedState('tri');

const useStyle = makeStyles({
  avatar: {
    '&.MuiAvatar-root': {
      transform: 'scale(0.8)',
    },
  },
  svg: {
    height: '50px',
  },
});

const TriPresence = ({ tri, alt, className, period, ...props }) => {
  const classes = useStyle();
  const [ownTri] = useTriState();
  const [hl, setHl] = React.useState(false);
  const color = alt ? 'secondary' : 'primary';
  const isOwnTri = sameLowC(ownTri, tri);
  const theme = useTheme();

  const avatarIcon = () => {
    if (period === AFTERNOON_PERIOD) {
      return (
        <Avatar className={classes.avatar}>
          <img src="/afternoon.svg" size="16x16" alt="afternoon icon" className={classes.svg} />
        </Avatar>
      );
    }
    if (period === MORNING_PERIOD) {
      return (
        <Avatar className={classes.avatar}>
          <img src="/morning.svg" size="16x16" alt="morning icon" className={classes.svg} />
        </Avatar>
      );
    }
    return null;
  };

  return (
    <>
      <Chip
        size="small"
        label={tri}
        avatar={avatarIcon()}
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
