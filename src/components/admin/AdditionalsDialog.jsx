import { Delete, DirectionsCar, HelpOutline } from '@mui/icons-material';
import { alpha, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, MenuItem, Select, TextField, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { useState } from 'react';
import AdditionalsPopup from './AdditionalsPopup';

const GAP_BETWEEN_SECTION = 1.5;

const useStyles = makeStyles(theme => ({
  root: {
    '& .MuiPaper-root': {
      maxWidth: 'unset',
    },
    '& a': {
      color: theme.palette.secondary.main,
    },
  },
  content: {
    overflow: 'visible',
    display: 'flex',
    gap: theme.spacing(GAP_BETWEEN_SECTION * 1.5),
  },
  form: {
    display: 'grid',
    gap: theme.spacing(GAP_BETWEEN_SECTION),
    maxWidth: '300px',
    height: 'fit-content',
  },
  formHeader: {
    display: 'flex',
    gap: theme.spacing(GAP_BETWEEN_SECTION),
  },
  section: {
    display: 'inherit',
    gap: theme.spacing(GAP_BETWEEN_SECTION / 3),
  },
  type: {
    display: 'flex',
  },
  iconSelector: {
    '& .MuiSelect-select': {
      height: '23px',
      textOverflow: 'unset',
      borderColor: 'red',
    },
  },
  coordsInput: {
    width: 50,
    '& input::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      '-moz-appearance': 'none',
      appearance: 'none',
      margin: 0,
    },
  },

  preview: {
    background: alpha(theme.palette.primary.fg, 0.1),
    minWidth: `calc(300px + ${theme.spacing(4)})`,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
  },
}));

function AdditionalsDialog ({ open, onClose }) {
  const classes = useStyles();

  const [info, setInfo] = useState({
    Titre: '',
    Description: '',
    Fixe: false,
    Tache: false,
    Icone: '',
    x: '0',
    y: '0',
    tris: undefined,
  });

  const getNewInfo = key => {
    if (key === 'Tache') {
      return { ...info, Fixe: false, Tache: true };
    }
    if (key === 'Fixe') {
      return { ...info, Fixe: true, Tache: false };
    }
    return { ...info, Fixe: false, Tache: false };
  };

  const handleChange = (key, value) => {
    setInfo({
      ...info,
      [key]: value,
    });

    setInfo(['popup', 'Tache', 'Fixe'].includes(key)
      ? getNewInfo(key)
      : {
        ...info,
        [key]: value,
      });
  };

  const getSelectValue = () => {
    if (info.Fixe) return 'fixed';
    if (info.Tache) return 'task';
    return 'popup';
  };

  const icons = {
    default: <HelpOutline />,
    delete: <Delete />,
    car: <DirectionsCar />,
  };

  return (
    <Dialog
      open={open}
      className={classes.root}
    >
      <DialogTitle><strong>Nouveau Point d'Information</strong></DialogTitle>
      <DialogContent className={classes.content}>
        <Box className={classes.form}>
          <Box className={classes.formHeader}>
            <TextField
              placeholder="Titre"
              fullWidth
              size="small"
              value={info.Titre}
              onChange={event => handleChange('Titre', event.target.value)}
            />
            <Box className={classes.section}>
              <TextField
                label="X"
                size="small"
                type="number"
                className={classes.coordsInput}
                value={info.x}
                onChange={event => handleChange('x', event.target.value)}
              />
              <TextField
                label="Y"
                size="small"
                type="number"
                className={classes.coordsInput}
                value={info.y}
                onChange={event => handleChange('y', event.target.value)}
              />
            </Box>
          </Box>
          <Box className={clsx([classes.section], [classes.type])}>
            <FormControl size="small" fullWidth>
              <Select value={getSelectValue()}>
                <MenuItem onClick={() => handleChange('popup', true)} value="popup">Popup</MenuItem>
                <MenuItem onClick={() => handleChange('Tache', true)} value="task">Tâche</MenuItem>
                <MenuItem onClick={() => handleChange('Fixe', true)} value="fixed">Fixe</MenuItem>
              </Select>
            </FormControl>
            {info.Tache && (
              <FormControl size="small" className={classes.iconSelector}>
                <Select
                  value={Object.keys(icons)[0]}
                  IconComponent={null}
                  onChange={event => handleChange('Icone', event.target.value)}
                >
                  {Object.keys(icons).map(key => (
                    <MenuItem key={key} value={key}>{icons[key]}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
          <TextField
            placeholder="Description"
            fullWidth
            multiline
            minRows={6}
            size="small"
            value={info.Description}
            onChange={event => handleChange('Description', event.target.value)}
            helperText={(
              <Typography sx={{ opacity: 0.5 }} variant="caption">
                Supporte la syntaxe <a href="https://markdownguide.org/cheat-sheet/" target="_blank" rel="noreferrer">markdown</a>.
              </Typography>
            )}
          />
        </Box>
        <Box className={classes.preview}>
          <AdditionalsPopup info={info} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Annuler</Button>
        <Button
          onClick={() => onClose(info)}
          disabled={!info.Titre || !info.Description || !info.x || !info.y}
        >Créer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(AdditionalsDialog);
