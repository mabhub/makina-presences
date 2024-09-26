import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import createPersistedState from 'use-persisted-state';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';

import usePlans from '../hooks/usePlans';
import usePresences from '../hooks/usePresences';
import useSpots from '../hooks/useSpots';
import { AFTERNOON_PERIOD, FULLDAY_PERIOD, MORNING_PERIOD } from './SpotButton';
import { baseFlags, isEnable } from '../feature_flag_service';

const useStyles = makeStyles(theme => ({
  buttonGroup: {
    marginBottom: theme.spacing(2),
  },
  toggleLabel: {
    textTransform: 'none',
  },
  toggleIcon: {
    marginRight: 7,
    fill: 'currentColor',
  },
  optionsWrapper: {
    marginTop: theme.spacing(1),
  },
  optionSummary: {
    marginLeft: '-16px',
    marginRight: '-16px',
    '&.MuiExpansionPanel-root:before': {
      display: 'none',
    },
  },

  optionsTitle: {
    opacity: 0.5,
  },
  options: {
    paddingLeft: theme.spacing(0),
  },
}));
const useFavoritesState = createPersistedState('favorites');

const SpotDialog = ({
  open,
  fastOpen,
  onClose = () => {},
  place,
  date,
  displayFavorite = false,
}) => {
  const classes = useStyles();
  const [favorites] = useFavoritesState([]);
  const plans = usePlans();
  const [selectedPlace, setSelectedPlace] = useState(place);

  const enableFavorite = isEnable(baseFlags.FF_FAVORITE);
  const enableHalfDay = isEnable(baseFlags.FF_HALFDAY);

  const [periodPref, setPeriodPref] = useState(FULLDAY_PERIOD);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const { presences } = usePresences(selectedPlace);
  const isoDate = dayjs(date).format('YYYY-MM-DD');
  const spotPresences = presences
    .filter(({ day: d }) => (d === isoDate))
    .filter(({ period }) => (periodPref === FULLDAY_PERIOD
      ? true
      : (period === periodPref || period === FULLDAY_PERIOD)))
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

  const defaultFavoriteSpot = favoriteSpots
    .find(({ Identifiant: spot }) => !spotPresences[spot] && displayFavorite);

  const [selectedValue, setSelectedValue] = React.useState((
    enableFavorite && defaultFavoriteSpot && displayFavorite ? defaultFavoriteSpot.Identifiant : ''
  ));

  const addDefaultSelect = () => {
    if (favoriteSpots.filter(({ Identifiant: spot }) => !spotPresences[spot]).length >= 1
        && displayFavorite
        && enableFavorite) {
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
    onClose(selectedValue, selectedPlace, periodPref);
  };

  const handleChange = event => {
    setSelectedValue(event.target.value);
  };

  const handleTabChange = (event, newPlace) => {
    setSelectedPlace(newPlace);
    handleChange({ target: { value: '' } });
    setSelectedValue('');
  };

  useEffect(() => {
    if (defaultFavoriteSpot && enableFavorite) {
      setSelectedValue(defaultFavoriteSpot.Identifiant);
    } else {
      setSelectedValue('');
    }
  }, [periodPref]);

  const handleKeyDown = event => {
    if (event.keyCode === 27) {
      handleCancel();
    }
  };

  useEffect(() => {
    if (fastOpen && selectedValue) {
      handleOk();
    }
  }, [fastOpen]);

  return (
    <Dialog
      maxWidth="xs"
      className={classes.root}
      fullScreen={fullScreen}
      open={open}
      onClick={event => event.stopPropagation()}
      onKeyDown={handleKeyDown}
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
            {displayFavorite && enableFavorite && favoriteSpots.length >= 1 && (
              <optgroup label="Vos Favoris">
                {favoriteSpots.map(({
                  id,
                  Identifiant: spot,
                  Type: { value: type },
                  Bloqué: locked,
                }) => createSelectOption(id, spot, type, locked))}

              </optgroup>
            )}
            {displayFavorite
              && enableFavorite
              && favoriteSpots.length >= 1
              && <option disabled>────────────</option>}
            {spots
              .filter(spot => !favoriteSpots.includes(spot) || !displayFavorite || !enableFavorite)
              .filter(({ Type: { value } = {} }) => value !== 'Parking' || displayFavorite)
              .map(({
                id,
                Identifiant: spot,
                Type: { value: type },
                Bloqué: locked,
              }) => createSelectOption(id, spot, type, locked))}
          </Select>
        </FormControl>

        {enableHalfDay && (
          <>
            <Divider
              sx={{
                mt: t => t.spacing(2),
                mb: t => t.spacing(1),
              }}
              textAlign="right"
            >
              <Typography variant="subtitle2" className={classes.optionsTitle}>Options</Typography>
            </Divider>
            <List
              dense
              disablePadding
              className={classes.options}
            >
              <ListItem disableGutters>
                <FormControl size="small" fullWidth>
                  <InputLabel>Période</InputLabel>
                  <Select
                    label="Période"
                    value={periodPref}
                    onChange={event => { setPeriodPref(event.target.value); }}
                  >
                    <MenuItem value={FULLDAY_PERIOD}>Journée</MenuItem>
                    <MenuItem value={MORNING_PERIOD}>Matiné</MenuItem>
                    <MenuItem value={AFTERNOON_PERIOD}>Après-midi</MenuItem>
                  </Select>
                </FormControl>
              </ListItem>
            </List>
          </>
        )}
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
