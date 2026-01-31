import clsx from 'clsx';
import React from 'react';
import createPersistedState from 'use-persisted-state';

import { alpha, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';

import { LocalParking } from '@mui/icons-material';
import { sameLowC } from '../helpers';
import { AFTERNOON_PERIOD, MORNING_PERIOD } from '../hooks/constants/periods';

const useTriState = createPersistedState('tri');

const useStyle = makeStyles(theme => ({
  chip: {
    transition: theme.transitions.create('background-color'),
    padding: theme.spacing(0, 0.8),
    borderRadius: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  icon: {
    height: '70%',
    width: 'auto',
    background: alpha(theme.palette.primary.fg, 0.4),
    borderRadius: '50%',
    padding: theme.spacing(0.1),
    color: 'black',
  },
}));

const TriPresence = ({ tri, alt, className, period, isParking, ...props }) => {
  const classes = useStyle();
  const [ownTri] = useTriState();
  const [hl, setHl] = React.useState(false);
  const isOwnTri = sameLowC(ownTri, tri);
  const theme = useTheme();
  const color = alt ? theme.palette.secondary.main : theme.palette.primary.main;
  const textColor = theme.palette.mode === 'dark' ? theme.palette.primary.fg : '#000';

  const avatarIcon = () => {
    if (period === MORNING_PERIOD) {
      return (
        <img src="/morning.svg" alt="morning icon" className={classes.icon} />
      );
    }
    if (period === AFTERNOON_PERIOD) {
      return (
        <img src="/afternoon.svg" alt="afternoon icon" className={classes.icon} />
      );
    }
    if (isParking) {
      return (
        <LocalParking className={classes.icon} />
      );
    }
    return null;
  };

  return (
    <>
      <Box
        className={clsx(classes.chip, `hl-${tri}`, className)}
        onMouseEnter={() => setHl(true)}
        onMouseLeave={() => setHl(false)}
        sx={{
          color: isOwnTri
            ? theme.palette.primary.contrastText
            : textColor,
          backgroundColor: isOwnTri
            ? color
            : alpha(theme.palette.primary.fg, 0.2),
        }}
        {...props}
      >
        {avatarIcon()}
        <Typography
          sx={{
            fontSize: '0.8125rem',
          }}
        >
          {tri}
        </Typography>
      </Box>

      {hl && !isOwnTri && (
        <style>
          {`
          .hl-${tri} {
            background-color: ${theme.palette.secondary.main};
            color:  ${theme.palette.secondary.contrastText};
          }
          .hl-${tri} img, .hl-${tri} svg{
            background: ${theme.palette.mode === 'light' ? alpha(theme.palette.primary.bg, 0.8) : ''};
          }
          `}
        </style>
      )}
    </>
  );
};

export default React.memo(TriPresence);
