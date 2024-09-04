import clsx from 'clsx';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import {
  Button,
  Container,
  FormControl,
  Grid,
  Input,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import createPersistedState from 'use-persisted-state';

import { cleanTri } from '../helpers';
import usePlans from '../hooks/usePlans';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    height: '100vh',
  },

  title: {
    textAlign: 'center',
    padding: theme.spacing(0, 2, 2),
  },

  placeButtons: {
    '& .Mui-selected': {
      background: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
  },

  submit: {
    padding: theme.spacing(2, 0),
    textAlign: 'center',
  },
}));

const useTriState = createPersistedState('tri');

const draftPlaceSx = {
  position: 'absolute',
  visibility: 'hidden',
  width: 0,
  height: 0,
  overflow: 'hidden',
};

const PresenceForm = ({ className, ...props }) => {
  const classes = useStyles();
  const { plans } = usePlans();
  const history = useHistory();

  const [tri, setTri] = useTriState('');
  const [inputValue, setInputValue] = React.useState(tri);
  const { place } = useParams();

  const handleTriChange = event => setInputValue(event.target.value.substr(0, 255));
  const handlePlaceChange = (event, newPlace) => history.push(`/${newPlace || place}`);

  const handleSubmit = () => setTri(cleanTri(inputValue));

  const handleKeyPress = event => {
    if (event.charCode === 13) {
      handleSubmit();
    }
  };

  return (
    <Container className={clsx(className, classes.root)}>
      <Grid
        container
        spacing={2}
        alignItems="center"
        {...props}
      >

        <Grid item container justifyContent="center" alignItems="flex-end">
          <Grid item xs={12} className={classes.title}>
            <Typography variant="h3" component="h1">
              Makina Présences
            </Typography>

            <Typography variant="subtitle2">
              Merci de <strong>choisir une agence</strong> et
              d'indiquer <strong>un trigramme</strong>.
            </Typography>
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            sx={{
              padding: 1,
              textAlign: {
                xs: 'center',
                sm: 'right',
              },
            }}
          >
            <ToggleButtonGroup
              size="small"
              className={classes.placeButtons}
              onChange={handlePlaceChange}
              exclusive
              value={place}
            >
              {plans.map(({ Name, Brouillon }) => (
                <ToggleButton
                  key={Name}
                  value={Name}
                  sx={Brouillon ? draftPlaceSx : {}}
                >
                  {Name}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            className={classes.formWrapper}
            sx={{
              padding: 1,
              textAlign: {
                xs: 'center',
                sm: 'left',
              },
            }}
          >
            <FormControl>
              <InputLabel htmlFor="tri">Trigramme</InputLabel>
              <Input
                id="tri"
                value={inputValue}
                onChange={handleTriChange}
                onKeyPress={handleKeyPress}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} className={classes.submit}>
            <Button
              variant="contained"
              color="secondary"
              disabled={!(place && inputValue?.length > 2 && inputValue?.length < 10)}
              onClick={handleSubmit}
            >
              Valider
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default React.memo(PresenceForm);
