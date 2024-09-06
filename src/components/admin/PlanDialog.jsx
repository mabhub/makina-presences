import { AddPhotoAlternateOutlined } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect, useState } from 'react';
import createPersistedState from 'use-persisted-state';

const useStyles = makeStyles(theme => ({
  wrapper: {
    width: '400px',
    aspectRatio: '16/9',
    marginTop: theme.spacing(1),
    border: '2px dashed #00000030',
    '&:hover, &:focus-within': {
      borderColor: '#000000',
    },
    borderRadius: '10px',
    position: 'relative',
  },
  input: {
    opacity: '0',
    width: '100%',
    height: '100%',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  icon: {
    opacity: 0.6,
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
  },
}));

const usePlanUpdate = createPersistedState('planUpdate');

function PlanDialog ({ open, onClose, edit, planName }) {
  const classes = useStyles();

  const [planUpdate] = usePlanUpdate();

  const [name, setName] = useState(planName);
  const nameValid = !planUpdate
    .filter(({ Name }) => Name !== planName)
    .filter(plan => !Object.hasOwn(plan, 'deleted'))
    .map(({ Name }) => Name)
    .includes(name);

  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState();

  useEffect(() => {
    if (!selectedFile) {
      return;
    }
    setPreview(URL.createObjectURL(selectedFile));
  }, [selectedFile]);

  const onSelectFile = event => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = () => {
    if (edit) {
      onClose(planName, name);
    } else {
      const formData = new FormData();
      formData.append('file', selectedFile);
      onClose(name, formData);
    }
  };

  return (
    <Dialog open={open}>
      <DialogTitle><strong>{edit ? `Modification de ${planName}` : 'Nouvel Espace'}</strong></DialogTitle>
      <DialogContent dividers>
        <TextField
          size="small"
          label="Nom"
          fullWidth
          value={name}
          onChange={event => setName(event.target.value)}
          error={!nameValid}
          helperText={nameValid ? '' : 'Ce nom est déjà prit'}
        />
        <br />

        {!edit && (
        <Box
          htmlFor="plan-picker"
          className={classes.wrapper}
          sx={{
            backgroundImage: selectedFile ? `url(${preview})` : '',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {!selectedFile && (<AddPhotoAlternateOutlined className={classes.icon} />)}
          <input
            id="plan-picker"
            type="file"
            accept=".png"
            className={classes.input}
            onChange={onSelectFile}
          />
        </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Annuler</Button>
        <Button
          onClick={handleSubmit}
          disabled={name === ''
            || (!edit && !selectedFile)
            || !nameValid}
        >{edit ? 'Modifier' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(PlanDialog);
