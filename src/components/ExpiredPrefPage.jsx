import { Button, Card, CardActions, CardContent, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import v, { localStorageSchema } from '../prefScheme';

const useStyles = makeStyles(theme => {
  const maxWidth = mq => `@media (max-width: ${theme.breakpoints.values[mq]}px)`;

  return {
    card: {
      maxWidth: '600px',
      width: '90%',
      margin: '10px auto',
      border: theme.palette.mode === 'light' ? '2px solid #00000030' : '2px solid #ededed30',
      borderRadius: '12px',
    },
    title: {
      marginTop: theme.spacing(-1),
      marginBottom: theme.spacing(1),
    },
    caption: {
      opacity: 0.5,
    },
    text: {
      marginBottom: theme.spacing(1),
    },
    cardActions: {
      float: 'right',
      [maxWidth('sm')]: {
        width: '100%',
        display: 'grid',
        gap: theme.spacing(1),
        '& .MuiButton-root': {
          width: '100%',
          margin: 'unset',
        },
      },
    },
    actionButton: {
      textTransform: 'none',
      borderRadius: '8px',
    },
    prefExpired: {
      fontSize: '0.75em',
      verticalAlign: 'top',
    },
  };
});

const parseLocalstorage = Object.keys(localStorage)
  .reduce((acc, curr) => {
    let parseValue;
    try {
      parseValue = JSON.parse(localStorage.getItem(curr));
    } catch (e) {
      parseValue = localStorage.getItem(curr);
    }

    return [
      ...acc,
      {
        [curr]: parseValue,
      },
    ];
  }, []);

export const expiredPref = parseLocalstorage
  .filter(pref => !v.validate(pref, localStorageSchema).valid);

const ExpiredPrefPage = () => {
  const classes = useStyles();

  const handlePrefRefresh = all => {
    if (all) {
      localStorage.clear();
    } else {
      expiredPref.forEach(p => localStorage.removeItem(Object.keys(p)[0]));
    }
    window.location.reload();
  };

  return (
    <Card
      className={classes.card}
      elevation={0}
    >
      <CardContent>
        <Typography variant="caption" className={classes.caption}>
          Erreur
        </Typography>

        <Typography variant="h6" className={classes.title}>
          <strong>Préférences Expirées</strong>
        </Typography>

        <Typography variant="body2" className={classes.text}>
          {/* eslint-disable-next-line max-len, no-trailing-spaces */}
          Le format enregistré de certaines de vos préférences<strong className={classes.prefExpired}>({expiredPref.length})</strong> ne sont
          plus à jour, essayez de les supprimer puis de les saisir à nouveau.
        </Typography>
      </CardContent>
      <CardActions
        className={classes.cardActions}
      >
        <Button
          variant="outlined"
          disableElevation
          color="error"
          className={classes.actionButton}
          onClick={() => handlePrefRefresh(true)}
        >
          Tout Supprimer
        </Button>
        <Button
          variant="contained"
          disableElevation
          color="error"
          className={classes.actionButton}
          onClick={() => handlePrefRefresh(false)}
        >
          <strong>Supprimer les Préférences Expirées</strong>
        </Button>
      </CardActions>
    </Card>
  );
};

export default ExpiredPrefPage;
