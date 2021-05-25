import React from 'react';
import { Container, Grid, Link } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { GitHub } from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(6),
  },
}));

const Footer = () => {
  const classes = useStyles();

  return (
    <Container className={classes.root}>
      <Grid container justify="center">
        <Grid item>
          <Link href="https://github.com/mabhub/makina-presences">
            <GitHub />
          </Link>
        </Grid>
      </Grid>
    </Container>
  );
};

export default React.memo(Footer);
