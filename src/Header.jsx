import React from 'react';

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

import { placesId } from './settings';

const useStyles = makeStyles(theme => ({
  placeButtons: {
    width: '100%',

    '& .Mui-selected': {
      background: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
  },
}));

const validPlaces = Object.keys(placesId);

/* eslint-disable key-spacing */
const grid = {
  spacer: { xs: 12, sm: 12, md: 12, lg: 3 },
  toggle: { xs:  3, sm:  2, md:  2, lg: 1 },
  tri:    { xs:  9, sm:  4, md:  4, lg: 3 },
};
/* eslint-enable */

const useTriState = createPersistedState('tri');
const usePlaceState = createPersistedState('place');

const Header = () => {
  const classes = useStyles();

  const [tri, setTri] = useTriState('');
  const [place, setPlace] = usePlaceState(validPlaces[0]);

  const handleTriChange = event => setTri(event.target.value);
  const handlePlaceChange = (event, newPlace) => {
    setPlace(prevPlace => (newPlace || prevPlace));
  };

  return (
    <Container style={{ marginTop: '2rem' }}>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item {...grid.spacer} />
        <Grid item {...grid.toggle}>
          <ToggleButtonGroup
            orientation="vertical"
            size="small"
            className={classes.placeButtons}
            onChange={handlePlaceChange}
            exclusive
            value={place}
          >
            <ToggleButton value="nantes">Nantes</ToggleButton>
            <ToggleButton value="toulouse">Toulouse</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid item {...grid.tri}>
          <FormControl fullWidth>
            <InputLabel htmlFor="tri">Trigramme</InputLabel>
            <Input
              id="tri"
              value={tri}
              onChange={handleTriChange}
            />
          </FormControl>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Header;
