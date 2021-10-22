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
}) => {
  const classes = useStyles();
  const [value, setValue] = React.useState();

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const spots = useSpots(place)
    .sort(({ Identifiant: a }, { Identifiant: b }) => a.localeCompare(b));
  const { presences } = usePresences(place);
  const isoDate = dayjs(date).format('YYYY-MM-DD');
  const spotPresences = presences
    .filter(({ day: d }) => (d === isoDate))
    .reduce((acc, { spot, tri }) => ({
      ...acc,
      [spot]: tri,
    }), {});

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
            {spots.map(({
              id,
              Identifiant: spot,
              Type: { value: type },
              Bloqué: locked,
            }) => {
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
            })}
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
