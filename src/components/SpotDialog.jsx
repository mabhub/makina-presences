import React from 'react';
import dayjs from 'dayjs';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';

import useSpots from '../hooks/useSpots';
import usePresences from '../hooks/usePresences';

const useStyles = makeStyles(() => ({
}));

const SpotDialog = ({
  open,
  onClose = () => {},
  place,
  date,
  displayFavorite = false,
}) => {
  const classes = useStyles();
  const [value, setValue] = React.useState();

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const spots = useSpots(place)
    .sort(({ Identifiant: a }, { Identifiant: b }) => a.localeCompare(b));
  const favorites = spots
    .filter(({Identifiant: id}) => (JSON.parse(localStorage.getItem("favorites")) || []).includes(id));

  const { presences } = usePresences(place);
  const isoDate = dayjs(date).format('YYYY-MM-DD');
  const spotPresences = presences
    .filter(({ day: d }) => (d === isoDate))
    .reduce((acc, { spot, tri }) => ({
      ...acc,
      [spot]: tri,
    }), {});

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
  }
    

  const handleCancel = () => {
    onClose();
  };

  const handleOk = () => {
    onClose(value);
  };

  const handleChange = event => {
    setValue(event.target.value);
  };

  return (
    <Dialog
      maxWidth="xs"
      className={classes.root}
      fullScreen={fullScreen}
      open={open}
      onClick={event => event.stopPropagation()}
    >
      <DialogContent dividers>
        <FormControl variant="outlined" fullWidth>
          <InputLabel htmlFor="spot-native-select">Poste</InputLabel>
          <Select
            native
            value={value}
            onChange={handleChange}
            label="Poste"
            inputProps={{
              name: 'spot',
              id: 'spot-native-select',
            }}
          >
            <option aria-label="Aucun" value="" />
            {displayFavorite && favorites.length >= 1&& (
              <optgroup label='Vos Favoris'>
                {favorites.map(({
                    id, 
                    Identifiant: spot, 
                    Type: {value: type}, 
                    Bloqué: locked
                  }) => createSelectOption(id, spot, type, locked))}
                
              </optgroup>
            )}
            {displayFavorite && favorites.length >= 1 && <option disabled>────────────</option>}
            {spots
              .filter(spot => !favorites.includes(spot) || !displayFavorite )
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

        <Button onClick={handleOk} color="primary" disabled={!value}>
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(SpotDialog);
