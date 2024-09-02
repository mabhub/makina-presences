import { Chip, FormControl, List, ListItem, ListItemText, MenuItem, Select, Switch, TextField } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React from 'react';
import useFields from '../../hooks/useFields';

const { VITE_TABLE_ID_SPOTS: spotsTableId } = import.meta.env;

const useStyles = makeStyles(theme => ({
  textField: {
    '& .MuiOutlinedInput-input': {
      padding: theme.spacing(0.5, 1),
    },
    width: '75px',
    marginLeft: theme.spacing(0.5),
  },
  idTextField: {
    '& .MuiOutlinedInput-input': {
      padding: theme.spacing(0.5, 1),
    },
    '& .MuiFormHelperText-root': {
      margin: theme.spacing(0),
      width: '130px',
      transform: 'translateX(-24%)',
      fontSize: '10px',
    },
    width: '90px',
  },
  idLabel: {
    transform: 'translateY(-25%)',
  },
}));

function SpotForm ({ edit, isDuplicating, isIDValid, spotInfo, handleChange }) {
  const classes = useStyles();
  const fields = useFields(spotsTableId);
  const spotTypes = fields
    ?.find?.(({ name }) => name === 'Type')
    ?.select_options || [];

  return (
    <List disablePadding sx={{}}>
      {(!edit || isDuplicating) && (
        <ListItem disablePadding>
          <ListItemText
            className={clsx({ [classes.idLabel]: !isIDValid })}
          >Identifiant <strong>*</strong>
          </ListItemText>
          <TextField
            required
            className={classes.idTextField}
            onChange={event => handleChange('Identifiant', event.target.value)}
            error={!isIDValid}
            helperText={isIDValid ? '' : 'Cet identifiant existe déjà'}
          />
        </ListItem>
      )}
      {!isDuplicating && (
      <>
        <ListItem disableGutters>
          <ListItemText>Position</ListItemText>
          <TextField
            label="X"
            variant="outlined"
            size="small"
            className={classes.textField}
            value={spotInfo?.x}
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
          <ListItemText>Type {!edit && (<strong>*</strong>)}</ListItemText>
          <FormControl size="small">
            <Select
              value={spotInfo.Type ? spotInfo.Type.value : ''}
              onChange={event => handleChange('Type', spotTypes.find(({ value }) => value === event.target.value))}
              required
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
      </>
      )}
    </List>
  );
}

export default React.memo(SpotForm);
