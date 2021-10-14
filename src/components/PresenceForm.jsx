import React from 'react';
import clsx from 'clsx';

import createPersistedState from 'use-persisted-state';
import {
  Container,
  FormControl,
  Grid,
  Input,
  InputLabel,
} from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';

import usePlans from '../hooks/usePlans';

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: theme.spacing(4),
  },
  placeButtons: {
    width: '100%',

    '& .Mui-selected': {
      background: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
  },
}));

const useTriState = createPersistedState('tri');
const usePlaceState = createPersistedState('place');

const PresenceForm = ({ className, ...props }) => {
  const classes = useStyles();
  const plans = usePlans();

  const [tri, setTri] = useTriState('');
  const [place, setPlace] = usePlaceState('');

  const handleTriChange = event => setTri(event.target.value.substr(0, 255));
  const handlePlaceChange = (event, newPlace) => {
    setPlace(prevPlace => (newPlace || prevPlace));
  };

  return (
    <Container className={clsx(className, classes.root)} {...props}>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item>
          <ToggleButtonGroup
            size="small"
            className={classes.placeButtons}
            onChange={handlePlaceChange}
            exclusive
            value={place}
          >
            {plans.map(({ Name }) => (
              <ToggleButton key={Name} value={Name}>{Name}</ToggleButton>
            ))}
          </ToggleButtonGroup>

          <FormControl fullWidth>
            <InputLabel htmlFor="tri">Trigramme</InputLabel>
            <Input id="tri" value={tri} onChange={handleTriChange} />
          </FormControl>
        </Grid>
      </Grid>
    </Container>
  );
};

export default React.memo(PresenceForm);
