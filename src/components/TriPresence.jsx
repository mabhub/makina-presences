import React from 'react';
import clsx from 'clsx';
import createPersistedState from 'use-persisted-state';

import { Avatar, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';

import { LocalParking } from '@mui/icons-material';
import { AFTERNOON_PERIOD, MORNING_PERIOD } from './SpotButton';
import { sameLowC } from '../helpers';

const useTriState = createPersistedState('tri');

const useStyle = makeStyles(theme => ({
  avatar: {
    '&.MuiAvatar-root': {
      transform: 'scale(0.8)',
    },
  },
  morning: {
    transform: 'scale(0.7)',
    '&.MuiChip-avatar': {
      margin: '0',
      backgroundColor: 'unset',
      marginRight: theme.spacing(-1),
    },
  },
  afternoon: {
    height: '100%',
    transform: 'scale(0.6)',
  },
}));

const TriPresence = ({ tri, alt, className, period, isParking, ...props }) => {
  const classes = useStyle();
  const [ownTri] = useTriState();
  const [hl, setHl] = React.useState(false);
  const color = alt ? 'secondary' : 'primary';
  const isOwnTri = sameLowC(ownTri, tri);
  const theme = useTheme();

  const avatarIcon = () => {
    if (period === MORNING_PERIOD) {
      return (
        <img src="/morning.svg" alt="morning icon" className={classes.morning} />
      );
    }
    if (isParking) {
      return (
        <Avatar className={classes.avatar}>
          <LocalParking sx={{ height: '80%' }} />
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
        deleteIcon={period === AFTERNOON_PERIOD
          ? (
            <img
              src="/afternoon.svg"
              alt="afternoon icon"
              className={classes.afternoon}
            />
          )
          : undefined}
        onDelete={period === AFTERNOON_PERIOD
          ? () => {}
          : undefined}
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
          .hl-${tri} img {
            filter: invert(100%)
          }
          `}
        </style>
      )}
    </>
  );
};

export default React.memo(TriPresence);
