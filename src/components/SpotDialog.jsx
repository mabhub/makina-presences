import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import createPersistedState from 'use-persisted-state';

import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';

import { Brightness4, Brightness5, Brightness7, ExpandLess, ExpandMore, Settings } from '@mui/icons-material';
import usePlans from '../hooks/usePlans';
import usePresences from '../hooks/usePresences';
import useSpots from '../hooks/useSpots';
import { AFTERNOON_PERIOD, FULLDAY_PERIOD, MORNING_PERIOD } from './SpotButton';

const { VITE_ENABLE_HALFDAY: enableHalfDay } = import.meta.env;

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

  const [periodPref, setPeriodPref] = useState(FULLDAY_PERIOD);
  const [optionsOpen, setOptionsOpen] = useState(false);

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
    if (defaultFavoriteSpot) {
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
        {fullScreen ? displayFavorite && enableHalfDay === 'true' && (
          <ToggleButtonGroup
            value={periodPref}
            exclusive
            size="small"
            className={classes.buttonGroup}
            fullWidth
          >
            <ToggleButton onClick={() => setPeriodPref(FULLDAY_PERIOD)} value={FULLDAY_PERIOD}>
              <Brightness7 className={classes.toggleIcon} />
              <span className={classes.toggleLabel}>Journée</span>
            </ToggleButton>
            <ToggleButton onClick={() => setPeriodPref(MORNING_PERIOD)} value={MORNING_PERIOD}>
              <Brightness5 className={classes.toggleIcon} />
              <span className={classes.toggleLabel}>Matinée</span>
            </ToggleButton>
            <ToggleButton onClick={() => setPeriodPref(AFTERNOON_PERIOD)} value={AFTERNOON_PERIOD}>
              <Brightness4 className={classes.toggleIcon} />
              <span className={classes.toggleLabel}>Après-midi</span>
            </ToggleButton>
          </ToggleButtonGroup>
        ) : displayFavorite && enableHalfDay === 'true' && (
          <List dense disablePadding>
            <ListItemButton onClick={() => { setOptionsOpen(!optionsOpen); }} disableGutters>
              <ListItemIcon><Settings /></ListItemIcon>
              <ListItemText primary="Options" sx={{ ml: '-24px' }} />
              {optionsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={optionsOpen} timeout="auto" unmountOnExit>
              <List component="div" sx={{ pl: '18px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Période</InputLabel>
                  <Select
                    label="Période"
                    value={periodPref}
                    onChange={event => { setPeriodPref(event.target.value); }}
                  >
                    <MenuItem value={FULLDAY_PERIOD}>Journée</MenuItem>
                    <MenuItem value={MORNING_PERIOD}>Matinée</MenuItem>
                    <MenuItem value={AFTERNOON_PERIOD}>Après-midi</MenuItem>
                  </Select>
                </FormControl>
              </List>
            </Collapse>
          </List>
        )}

        {displayFavorite && enableHalfDay === 'true' && (
        <Divider sx={{
          mb: t => t.spacing(2.5),
          mt: t => t.spacing(1),
          mx: '-24px',
        }}
        />
        )}

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
