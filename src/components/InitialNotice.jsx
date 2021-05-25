import React from 'react';
import { Container, Grid } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

const InitialNotice = props => (
  <Container {...props}>
    <Grid container justify="center">
      <Grid item xs={10}>
        <Alert severity="info">
          Choisir un lieu et saisir un trigramme pour pouvoir remplir les présences.
        </Alert>
      </Grid>
    </Grid>
  </Container>
);

export default InitialNotice;
