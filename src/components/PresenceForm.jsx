import clsx from 'clsx';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import {
  Button,
  Container,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import createPersistedState from 'use-persisted-state';

import usePlans from '../hooks/usePlans';
import { NO_AGENCYPREF_LABEL } from './PreferencesFavorites';

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

const useAgencyPref = createPersistedState('agency');

const draftPlaceSx = {
  position: 'absolute',
  visibility: 'hidden',
  width: 0,
  height: 0,
  overflow: 'hidden',
};

const PresenceForm = ({ className, ...props }) => {
  const classes = useStyles();
  const plans = usePlans();
  const history = useHistory();

  const [agencyPref] = useAgencyPref();
  const [agency, setAgency] = useState();

  if (agencyPref && agencyPref !== NO_AGENCYPREF_LABEL) {
    history.push(`/${agencyPref}`);
  }

  const handlePlaceChange = (event, newPlace) => setAgency(newPlace);

  const handleSubmit = () => history.push(`/${agency}`);

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
              Merci de <strong>choisir une agence</strong>.
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
              },
            }}
          >
            <ToggleButtonGroup
              size="small"
              className={classes.placeButtons}
              onChange={handlePlaceChange}
              exclusive
              value={agency}
            >
              {plans
                .filter(({ Brouillon }) => !Brouillon)
                .map(({ Name, Brouillon }) => (
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

          <Grid item xs={12} className={classes.submit}>
            <Button
              variant="contained"
              color="secondary"
              disabled={!agency}
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
