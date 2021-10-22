import React from 'react';
import { Container, Grid, Link } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { GitHub } from '@mui/icons-material';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(6),
  },
}));

const Footer = () => {
  const classes = useStyles();

  return (
    <Container className={classes.root}>
      <Grid container justifyContent="center">
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
