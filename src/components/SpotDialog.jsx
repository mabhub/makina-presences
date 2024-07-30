import dayjs from 'dayjs';
import React, { useState } from 'react';
import createPersistedState from 'use-persisted-state';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  Tab,
  Tabs,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';

import usePlans from '../hooks/usePlans';
import usePresences from '../hooks/usePresences';
import useSpots from '../hooks/useSpots';

const useStyles = makeStyles(() => ({
}));
const useFavoritesState = createPersistedState('favorites');

const SpotDialog = ({
  open,
  onClose = () => {},
  place,
  date,
  displayFavorite = false,
}) => {
  const classes = useStyles();
  const [favorites] = useFavoritesState([]);
  const plans = usePlans();
  const [selectedPlace, setSelectedPlace] = useState(place);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const { presences } = usePresences(selectedPlace);
  const isoDate = dayjs(date).format('YYYY-MM-DD');
  const spotPresences = presences
    .filter(({ day: d }) => (d === isoDate))
    .reduce((acc, { spot, tri }) => ({
      ...acc,
      [spot]: tri,
    }), {});

  const spots = useSpots(selectedPlace)
    .sort(({ Identifiant: a }, { Identifiant: b }) => a.localeCompare(b));
  const favoriteName = favorites
    .filter(({ place: spotPLace }) => spotPLace === selectedPlace)
    .reduce((acc, curr) => [...acc, curr.name], []);
  const favoriteSpots = spots
    .filter(({ Identifiant: id }) => favoriteName.includes(id))
    .sort(
      ({ Identifiant: a }, { Identifiant: b }) => favoriteName.indexOf(a) - favoriteName.indexOf(b),
    );

  const defaultFavoriteSpot = favoriteSpots[favoriteSpots
    .findIndex(({ Identifiant: spot }) => !spotPresences[spot])];

  const [selectedValue, setSelectedValue] = React.useState((
    defaultFavoriteSpot && displayFavorite ? defaultFavoriteSpot.Identifiant : ''
  ));

  const addDefaultSelect = () => {
    if (favoriteSpots.filter(({ Identifiant: spot }) => !spotPresences[spot]).length >= 1
        && displayFavorite) {
      return '';
    }
    return <option aria-label="Aucun" value="" />;
  };

  const createSelectOption = (id, spot, type, locked) => {
    const tri = spotPresences[spot];
    const icons = {
      Nu: '🔵',
      Flex: '🟢',
      Réservé: '🔴',
      Priorisé: '🟠',
    };

    return (
      <option
        key={id}
        value={spot}
        disabled={spotPresences[spot] || locked}
      >
        {locked ? '🔒' : icons[type]}{' '}
        {spot}
        {tri && ` → ${tri}`}
      </option>
    );
  };

  const handleCancel = () => {
    onClose();
  };

  const handleOk = () => {
    onClose(selectedValue, selectedPlace);
  };

  const handleChange = event => {
    setSelectedValue(event.target.value);
  };

  const handleTabChange = (event, newPlace) => {
    setSelectedPlace(newPlace);
    handleChange({ target: { value: '' } });
  };

  return (
    <Dialog
      maxWidth="xs"
      className={classes.root}
      fullScreen={fullScreen}
      open={open}
      onClick={event => event.stopPropagation()}
    >
      {!displayFavorite && (
        <Tabs
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
          value={selectedPlace}
        >
          {plans.map(({ Name, Brouillon }) => (
            <Tab
              key={Name}
              value={Name}
              label={Name}
              sx={Brouillon ? { display: 'none' } : { textTransform: 'none' }}
            />
          ))}
        </Tabs>
      )}

      <DialogContent dividers>
        <FormControl variant="outlined" fullWidth>
          <InputLabel htmlFor="spot-native-select">Poste</InputLabel>
          <Select
            native
            value={selectedValue}
            onChange={handleChange}
            label="Poste"
            inputProps={{
              name: 'spot',
              id: 'spot-native-select',
            }}
          >
            {addDefaultSelect()}
            {displayFavorite && favoriteSpots.length >= 1 && (
              <optgroup label="Vos Favoris">
                {favoriteSpots.map(({
                  id,
                  Identifiant: spot,
                  Type: { value: type },
                  Bloqué: locked,
                }) => createSelectOption(id, spot, type, locked))}

              </optgroup>
            )}
            {displayFavorite && favoriteSpots.length >= 1 && <option disabled>────────────</option>}
            {spots
              .filter(spot => !favoriteSpots.includes(spot) || !displayFavorite)
              .map(({
                id,
                Identifiant: spot,
                Type: { value: type },
                Bloqué: locked,
              }) => createSelectOption(id, spot, type, locked))}
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button autoFocus onClick={handleCancel}>
          Annuler
        </Button>

        <Button onClick={handleOk} color="primary" disabled={!selectedValue}>
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(SpotDialog);
