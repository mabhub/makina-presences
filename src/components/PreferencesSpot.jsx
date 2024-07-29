import React from 'react';
import createPersistedState from 'use-persisted-state';

import { Add, ErrorOutline, RemoveCircleOutline } from '@mui/icons-material';
import { Chip, Divider, IconButton, List, ListItem, ListItemIcon, ListItemText, Tooltip, Typography } from '@mui/material';

import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import SpotDialog from './SpotDialog';
import usePlans from '../hooks/usePlans';
import useTable from '../hooks/useTable';

const { VITE_TABLE_ID_SPOTS: spotsTableId } = import.meta.env;

const useFavoritesState = createPersistedState('favorites');
const useStyles = makeStyles({
  favoriteList: {
    paddingTop: 'O',
    paddingBottom: '12px',
  },
  favoriteItem: {
    paddingLeft: '30px',
    paddingTop: '0',
    paddingBottom: '0',
  },
});

const PreferencesSpot = () => {
  const [favorites, setFavorites] = useFavoritesState([]);
  const { place } = useParams();
  const spots = useTable(Number(spotsTableId));
  const plans = usePlans();
  const classes = useStyles();

  const sortedFavorite = plans
    .map(plan => ({
      agency: plan.Name,
      favs: favorites.filter(({ place: favPlace }) => favPlace === plan.Name),
    }));

  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleDialogClose = value => {
    setDialogOpen(false);
    if (!value || favorites.includes(value)) return;
    setFavorites([
      ...favorites,
      {
        name: value,
        place: spots
          .filter(
            ({
              Identifiant: id,
              Plan: [{ value: plan } = {}] = [],
            }) => id === value && plan === place,
          )[0].Plan[0].value,
      },
    ]);
  };

  const removeFavorite = (spotName, spotPlace) => {
    setFavorites(favorites
      .filter(fav => (fav.name === spotName && fav.place !== spotPlace) || fav.name !== spotName));
  };

  const displayTitle = agency => sortedFavorite
    .filter(favorite => favorite.agency !== agency)
    .reduce((acc, curr) => acc || curr.favs.length > 0, false);

  const hasFavorite = () =>
    sortedFavorite.reduce((acc, curr) => acc && curr.favs.length === 0, true);

  const createListItem = (favs, agency) => {
    const removedFavorites = favs
      .filter(spot => Object.hasOwn(spot, 'name'))
      .filter(({ name: spotName }) => !spots.map(spot => spot.Identifiant).includes(spotName));

    const filteredFavorites = favs
      .filter(({ name: spotName }) =>
        spots.map(spot => spot.Identifiant).includes(spotName)
        || removedFavorites.map(spot => spot.name).includes(spotName));

    return filteredFavorites.map(({ name, place: spotPlace }) => {
      const icons = {
        Nu: '🔵',
        Flex: '🟢',
        Réservé: '🔴',
        Priorisé: '🟠',
      };
      const spotIcon = spots
        .filter(({
          Identifiant: id,
          Plan: [{ value: plan } = {}] = [],
        }) => id === name && plan === spotPlace)
        .map(({ Type: { value: type } }) => (icons[type]));

      return (
        <ListItem
          key={`${name}${spotPlace}`}
          className={clsx({ [classes.favoriteItem]: displayTitle(agency) })}
          secondaryAction={(
            <IconButton
              edge="end"
              aria-label="remove"
              sx={{ color: 'red', opacity: '.5' }}
              component="button"
              onClick={() => removeFavorite(name, spotPlace)}
            >
              <RemoveCircleOutline />
            </IconButton>
            )}
        >
          {removedFavorites.some(({ name: spotName }) => spotName === name) && (
            <Tooltip title="Ce poste n'existe plus" placement="left">
              <ListItemIcon>
                <ErrorOutline color="error" />
              </ListItemIcon>
            </Tooltip>
          )}
          <ListItemText
            primary={`${spotIcon} ${name}`}
          />
        </ListItem>
      );
    });
  };

  return (
    <>
      <Divider textAlign="left">
        Postes Favoris
        <Chip
          label="Ajouter"
          size="small"
          variant="outlined"
          color="primary"
          icon={<Add />}
          sx={{ ml: 2 }}
          component="button"
          onClick={() => setDialogOpen(!dialogOpen)}
        />
      </Divider>

      <List dense className={clsx({ [classes.favoriteList]: hasFavorite() })}>
        {hasFavorite() && (
          <Typography sx={{ opacity: 0.4, textAlign: 'center', fontSize: '12px', margin: '15px' }}>
            Aucun postes favoris.
          </Typography>
        )}
        {sortedFavorite.map(({ agency, favs }) => (
          <React.Fragment key={agency}>
            {favs.length > 0
            && displayTitle(agency)
            && (
              <ListItem sx={{ mb: '-8px', mt: '-2px', opacity: '.5' }}>
                <ListItemText primary={agency} />
              </ListItem>
            )}
            {createListItem(favs, agency)}
          </React.Fragment>
        ))}
      </List>

      {dialogOpen && (
        <SpotDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          place={place}
          date={null}
        />
      )}
    </>
  );
};

export default React.memo(PreferencesSpot);
