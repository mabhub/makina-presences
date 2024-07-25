import React from 'react';
import createPersistedState from 'use-persisted-state';

import { Add, ErrorOutline, RemoveCircleOutline } from '@mui/icons-material';
import { Chip, Divider, IconButton, List, ListItem, ListItemIcon, ListItemText, Tooltip, Typography } from '@mui/material';

import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import useSpots from '../hooks/useSpots';
import SpotDialog from './SpotDialog';

const useFavoritesState = createPersistedState('favorites');

const PreferencesSpot = () => {
  const [favorites, setFavorites] = useFavoritesState([]);
  const { place } = useParams();
  const spots = useSpots(place);

  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleDialogClose = value => {
    setDialogOpen(false);
    if (!value || favorites.includes(value)) return;
    setFavorites([
      ...favorites,
      {
        name: value,
        place: spots.filter(spot => spot.Identifiant === value)[0].Plan[0].value,
      },
    ]);
  };

  const removeFavorite = value => {
    setFavorites(favorites.filter(favorite => favorite.name !== value || favorite.place !== place));
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

      <List dense>
        {favorites.filter(({ place: spotPlace }) => spotPlace === place).length === 0 && (
        <Typography sx={{ opacity: 0.4, textAlign: 'center', fontSize: '12px', margin: '15px' }}>
          Aucun postes favoris.
        </Typography>
        )}
        {favorites
          .filter(({ place: spotPlace }) => spotPlace === place)
          .map(({ name }) => {
            const icons = {
              Nu: '🔵',
              Flex: '🟢',
              Réservé: '🔴',
              Priorisé: '🟠',
            };
            const spotIcon = spots
              .filter(spot => spot.Identifiant === name)
              .map(({ Type: { value: type } }) => (icons[type]));

            return (
              <ListItem
                key={name}
                secondaryAction={(
                  <IconButton
                    edge="end"
                    aria-label="remove"
                    sx={{ color: 'red', opacity: '.5' }}
                    component="button"
                    onClick={() => removeFavorite(name)}
                  >
                    <RemoveCircleOutline />
                  </IconButton>
              )}
              >
                {favorites
                  .filter(
                    ({ name: spotName }) => !spots.map(spot => spot.Identifiant).includes(spotName),
                  )
                  .some(({ name: spotName }) => spotName === name) && (
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
          })}
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
