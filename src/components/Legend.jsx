import React from 'react';

import { Box, Divider, IconButton } from '@material-ui/core';
import { makeStyles, useTheme, alpha } from '@material-ui/core/styles';
import { ExpandMore } from '@material-ui/icons';
import createPersistedState from 'use-persisted-state';

import useFields from '../hooks/useFields';
import Circle from './LegendCircle';

const useLegendState = createPersistedState('legend');

const useLegendStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    zIndex: 1,
    transform: ({ hidden }) => `translateX(-50%) translateY(${hidden ? 100 : 0}%)`,
    transition: theme.transitions.create('transform'),

    background: 'rgba(255, 255, 255, 0.8)',
    padding: theme.spacing(0.5, 1, 1),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
  },

  handle: {
    textAlign: 'center',
    position: 'relative',

    transform: ({ hidden }) => (
      hidden
        ? 'translateY(-150%) rotate(180deg)'
        : ''
    ),
    transition: theme.transitions.create('transform'),
  },

  divider: {
    margin: theme.spacing(1),
  },
}));

const Legend = () => {
  const theme = useTheme();
  const fields = useFields(32973);

  const [legendHidden, setLegendHidden] = useLegendState(false);
  const legendToggle = () => setLegendHidden(p => !p);

  const classes = useLegendStyles({ hidden: legendHidden });

  const spotTypes = fields
    ?.find?.(({ name }) => name === 'Type')
    ?.select_options || [];

  return (
    <Box className={classes.root}>
      <Box className={classes.handle}>
        <IconButton
          size="small"
          onClick={legendToggle}
        >
          <ExpandMore />
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

export default Legend;
