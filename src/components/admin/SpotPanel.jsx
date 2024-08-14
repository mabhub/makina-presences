import { Close } from '@mui/icons-material';
import { alpha, Avatar, Button, Card, CardActionArea, CardActions, CardContent, CardHeader, Chip, FormControl, IconButton, List, ListItem, ListItemText, MenuItem, Select, Switch, TextField, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect, useState } from 'react';
import createPersistedState from 'use-persisted-state';
import useFields from '../../hooks/useFields';

const { VITE_TABLE_ID_SPOTS: spotsTableId } = import.meta.env;

const useStyles = makeStyles(theme => {
  const maxWidth = mq => `@media (max-width: ${theme.breakpoints.values[mq]}px)`;
  return {
    cardEdit: {
      padding: theme.spacing(1, 2, 0, 0),
    },
    textField: {
      '& .MuiOutlinedInput-input': {
        padding: theme.spacing(0.5, 1),
      },
      width: '75px',
      marginLeft: theme.spacing(0.5),
    },
    delete: {
      width: '100%',
      margin: theme.spacing(1, 0, 0, 0),
      padding: theme.spacing(1.5, 0),
      border: `1.5px solid ${alpha(theme.palette.error.light, 0.5)}`,
      borderRadius: '8px',
    },
  };
});

const useUpdatedStack = createPersistedState('updateStack');
const useUndidStack = createPersistedState('undidStack');

export const DELETED_KEY = 'deleted';

function SpotPanel ({ spot, onClose, handleUpdate }) {
  const classes = useStyles();
  const fields = useFields(spotsTableId);

  const { Identifiant } = spot;

  const spotTypes = fields
    ?.find?.(({ name }) => name === 'Type')
    ?.select_options || [];

  const [spotInfo, setSpotInfo] = useState(spot);
  const [previousSpotInfo, setPreviousSpotInfo] = useState(spotInfo);

  useEffect(() => {
    setSpotInfo(spot);
  }, [spot]);

  const handleChange = (key, value) => {
    setPreviousSpotInfo({
      ...spotInfo,
    });
    setSpotInfo({
      ...spotInfo,
      [key]: value,
    });
  };

  useEffect(() => {
    const [diff] = [
      ...new Set([
        ...Object.keys(previousSpotInfo),
        ...Object.keys(spotInfo),
      ]),
    ].filter(k =>
      previousSpotInfo[k] !== spotInfo[k]
      && previousSpotInfo.Identifiant === spotInfo.Identifiant);

    handleUpdate(spotInfo, diff);
  }, [spotInfo]);

  return (
    <Card className={classes.cardEdit} elevation={0}>
      <CardHeader
        avatar={(
          <Avatar sx={{
            backgroundColor: theme => theme.palette.primary.bg,
            color: theme => theme.palette.primary.fg,
            border: '2px solid',
            borderColor: spotInfo.Type?.color?.replace('-', ''),
          }}
          >
            {Identifiant}
          </Avatar>
            )}
        title={(
          <Typography variant="h6">
            Configuration
          </Typography>
            )}
        subheader={`Poste ${Identifiant}`}
        action={(
          <IconButton onClick={() => onClose(false)}>
            <Close />
          </IconButton>
        )}
      />
      {/* <Divider sx={{ mx: '-16px' }} /> */}
      <CardContent>
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemText>Position</ListItemText>
            <TextField
              label="X"
              variant="outlined"
              size="small"
              className={classes.textField}
              value={spotInfo.x}
              type="number"
              onChange={event => handleChange('x', event.target.value)}
            />
            <TextField
              label="Y"
              variant="outlined"
              size="small"
              className={classes.textField}
              value={spotInfo.y}
              type="number"
              onChange={event => handleChange('y', event.target.value)}
            />

          </ListItem>
          <ListItem disablePadding>
            <ListItemText>Bloqué</ListItemText>
            <Switch
              onChange={() => handleChange('Bloqué', !spotInfo.Bloqué)}
              checked={spotInfo.Bloqué}
            />
          </ListItem>
          <ListItem disablePadding>
            <ListItemText>Cumulable</ListItemText>
            <Switch
              onChange={() => handleChange('Cumul', !spotInfo.Cumul)}
              checked={spotInfo.Cumul}
            />
          </ListItem>
          <ListItem disablePadding>
            <ListItemText>Type</ListItemText>
            <FormControl size="small">
              <Select
                value={spotInfo.Type.value}
                onChange={event => handleChange('Type', spotTypes.find(({ value }) => value === event.target.value))}
              >
                {spotTypes.map(({ value, color }) => (
                  <MenuItem value={value} key={value}>
                    <Chip
                      label={value}
                      sx={{
                        background: color.replace('-', ''),
                        opacity: 0.5,
                        color: 'transparent',
                      }}
                    />
                    <Chip
                      label={value}
                      sx={{
                        background: 'transparent',
                        position: 'absolute',
                        left: 14,
                      }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </ListItem>
          <ListItem disableGutters>
            <TextField
              fullWidth
              label="Description"
              variant="outlined"
              value={spotInfo.Description || ''}
              multiline
              rows={4}
              onChange={event => handleChange('Description', event.target.value)}
            />
          </ListItem>
        </List>
        <Button
          size="small"
          color="error"
          className={classes.delete}
          onClick={() => handleChange(DELETED_KEY, true)}
        >
          Supprimer Poste
        </Button>
      </CardContent>
    </Card>
  );
}

export default React.memo(SpotPanel);
