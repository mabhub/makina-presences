import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { AddPhotoAlternate, AddPhotoAlternateOutlined } from '@mui/icons-material';

const useStyles = makeStyles(theme => ({
  wrapper: {
    width: '400px',
    aspectRatio: '16/9',
    marginTop: theme.spacing(1),
    border: '2px dashed #00000030',
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

function NewSpotDialog ({ open, onClose }) {
  const classes = useStyles();

  const [name, setName] = useState('');

  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState();

  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }

    setPreview(URL.createObjectURL(selectedFile));
  }, [selectedFile]);

  const onSelectFile = event => {
    if (!event.target.files || event.target.files.length === 0) {
      setSelectedFile(undefined);
      return;
    }
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = () => {
    const reader = new FileReader();
    reader.onload = e => {
      onClose(name, e.target.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <Dialog open={open}>
      <DialogTitle><strong>Nouvel Espace</strong></DialogTitle>
      <DialogContent dividers>
        <TextField
          size="small"
          label="Nom"
          fullWidth
          value={name}
          onChange={event => setName(event.target.value)}
        />
        <br />

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
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Annuler</Button>
        <Button onClick={handleSubmit} disabled={name === '' || !selectedFile}>Créer</Button>
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(NewSpotDialog);
