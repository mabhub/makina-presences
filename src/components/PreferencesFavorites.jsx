import React, { useState } from 'react';
import createPersistedState from 'use-persisted-state';

import { Add, Computer, ErrorOutline, RemoveCircleOutline, Room } from '@mui/icons-material';
import { Chip, Divider, FormControl, IconButton, List, ListItem, ListItemIcon, ListItemText, MenuItem, Select, Tooltip, Typography } from '@mui/material';

import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import usePlans from '../hooks/usePlans';
import useTable from '../hooks/useTable';
import SpotDialog from './SpotDialog';
import { baseFlags, isEnable } from '../feature_flag_service';

const { VITE_TABLE_ID_SPOTS: spotsTableId } = import.meta.env;

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: '0',
  },
  favoriteList: {
    marginTop: '0px',
    marginLeft: '25px',
    marginBottom: '12px',
    borderLeft: `2px solid ${theme.palette.mode === 'light' ? '#00000030' : '#ededed30'}`,
    // borderBottomLeftRadius: '5px',
  },
  favoriteItem: {
    paddingLeft: '21px',
    paddingTop: '0',
    paddingBottom: '0',
  },
  select: {
    '& .MuiSelect-select': {
      padding: theme.spacing(0.5, 1.5),
      fontSize: '12px',
    },
  },
}));

const useFavoritesState = createPersistedState('favorites');
const useAgencyPref = createPersistedState('agency');

export const NO_AGENCYPREF_LABEL = 'Aucune';

const PreferencesFavorites = () => {
  const [favorites, setFavorites] = useFavoritesState([]);
  const { place } = useParams();
  const spots = useTable(Number(spotsTableId));
  const plans = usePlans();
  const classes = useStyles();

  const enableAgency = isEnable(baseFlags.FF_AGENCY);
  const enableFavorite = isEnable(baseFlags.FF_FAVORITE);

  const agencies = [{ Name: NO_AGENCYPREF_LABEL }].concat(plans);
  const [agencyPref, setAgencyPref] = useAgencyPref();
  const [selectedAgency, setSelectedAgency] = useState(agencyPref || agencies[0].Name);

  const sortedFavorite = plans
    .map(plan => ({
      agency: plan.Name,
      favs: favorites.filter(({ place: favPlace }) => favPlace === plan.Name),
    }));

  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleDialogClose = (value, spotPlace) => {
    setDialogOpen(false);
    if (!value || favorites
      .filter(({ place: p }) => p === spotPlace)
      .map(({ name }) => name)
      .includes(value)) return;
    setFavorites([
      ...favorites,
      {
        name: value,
        place: spotPlace,
      },
    ]);
  };

  const removeFavorite = (spotName, spotPlace) => {
    setFavorites(favorites
      .filter(fav => (fav.name === spotName && fav.place !== spotPlace) || fav.name !== spotName));
  };

  const createListItem = favs => {
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
          className={classes.favoriteItem}
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

  const handleChange = event => {
    setSelectedAgency(event.target.value);
    setAgencyPref(event.target.value);
  };

  return (
    <>
      {(enableAgency || enableFavorite) && (
        <>
          <Divider textAlign="left"> Préférences </Divider>
          <List className={classes.root} dense>
            {enableAgency && (
              <ListItem>
                <ListItemIcon sx={{ marginRight: '-25px' }}><Room /></ListItemIcon>
                <ListItemText primary="Agence par défaut" />
                <FormControl size="small">
                  <Select
                    className={classes.select}
                    value={selectedAgency}
                    onChange={handleChange}
                  >
                    {agencies
                      .filter(({ Brouillon }) => !Brouillon)
                      .map(({ Name }) => (
                        <MenuItem key={Name} value={Name}>{Name}</MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </ListItem>
            )}
            {enableFavorite && (
              <>
                <ListItem>
                  <ListItemIcon sx={{ marginRight: '-25px' }}><Computer /></ListItemIcon>
                  <ListItemText primary="Postes favoris" />
                  <Chip
                    label="Ajouter"
                    size="small"
                    variant="outlined"
                    color="primary"
                    icon={<Add />}
                    component="button"
                    onClick={() => setDialogOpen(!dialogOpen)}
                  />
                </ListItem>
                <div className={classes.favoriteList}>
                  {sortedFavorite.map(({ agency, favs }) => (
                    <React.Fragment key={agency}>
                      {favs.length > 0
                && (
                  <ListItem sx={{ mb: '-8px', mt: '-2px', ml: '-7px', position: 'relative' }}>
                    <Typography variant="caption" sx={{ opacity: 0.5 }}>{agency}</Typography>
                  </ListItem>
                )}
                      {createListItem(favs)}
                    </React.Fragment>
                  ))}
                </div>
              </>
            )}
          </List>
        </>
      )}

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

export default React.memo(PreferencesFavorites);
