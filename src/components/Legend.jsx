import React from 'react';

import { ExpandMore, HelpOutline } from '@mui/icons-material';
import { Box, Divider, IconButton } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createPersistedState from 'use-persisted-state';

import clsx from 'clsx';
import useFields from '../hooks/useFields';
import Circle from './LegendCircle';

const { VITE_TABLE_ID_SPOTS: spotsTableId } = import.meta.env;

const useLegendState = createPersistedState('legend');

const useLegendStyles = makeStyles(theme => {
  const maxWidth = mq => `@media (max-width: ${theme.breakpoints.values[mq]}px)`;

  return { root: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    zIndex: 1,
    transform: ({ hidden }) => `translateX(-50%) translateY(${hidden ? 100 : 0}%)`,
    transition: theme.transitions.create('transform'),
    background: alpha(theme.palette.primary.bg, 0.8),
    padding: theme.spacing(0.5, 1, 1),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
  },

  handle: {
    textAlign: 'center',
    position: 'relative',

    transform: ({ hidden }) => (
      hidden
        ? 'translateY(-150%)'
        : ''
    ),
    transition: theme.transitions.create('transform'),
    [maxWidth('sm')]: {
      bottom: '30px',
    },
  },
  toggled: {
    [maxWidth('sm')]: {
      bottom: '25px',
    },
  },
  handleToggled: {
    [maxWidth('sm')]: {
      bottom: 0,
    },
  },

  divider: {
    margin: theme.spacing(1),
  } };
});

const Legend = () => {
  const theme = useTheme();
  const fields = useFields(spotsTableId);

  const [legendHidden, setLegendHidden] = useLegendState(true);
  const legendToggle = () => setLegendHidden(p => !p);

  const classes = useLegendStyles({ hidden: legendHidden });

  const spotTypes = fields
    ?.find?.(({ name }) => name === 'Type')
    ?.select_options || [];

  return (
    <Box className={clsx({
      [classes.root]: true,
      [classes.toggled]: !legendHidden,
    })}
    >
      <Box className={clsx({
        [classes.handle]: true,
        [classes.handleToggled]: !legendHidden,
      })}
      >
        <IconButton
          size="small"
          onClick={legendToggle}
        >
          {!legendHidden && <ExpandMore />}
          {legendHidden && <HelpOutline />}
        </IconButton>
      </Box>

      {spotTypes.map(({ id, color, value }) => (
        <Circle key={id} color={color} label={value} />
      ))}
      <Circle label="Verrouillé" />

      <Divider className={classes.divider} />

      <Circle color="green" label="Libre" />
      <Circle color="green" label="Occupé" bgColor={alpha(theme.palette.primary.main, 0.5)} />
    </Box>
  );
};

export default React.memo(Legend);
