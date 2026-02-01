import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(() => ({
  button: {
    textTransform: 'none',
  },
}));

const ParkingDialog = ({
  open,
  onClose,
}) => {
  const classes = useStyles();
  const onSubmit = value => {
    onClose(value);
  };

  const handleKeyDown = event => {
    if (event.keyCode === 27) {
      onSubmit(false);
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      onSubmit(true);
    }
  };

  const textConfirm = 'Vous êtes toujours inscrit sur une ou plusieurs places de parking. Voulez-vous aussi vous désinscrire de celles-ci ?';

  return (
    <Dialog
      maxWidth="xs"
      open={open}
      onKeyDown={handleKeyDown}
    >
      <DialogTitle>
        Se désinscrire aussi du parking ?
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          {textConfirm}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => onSubmit(false)}
          variant="outlined"
          className={classes.button}
        >
          Non
        </Button>
        <Button
          onClick={() => onSubmit(true)}
          variant="contained"
          className={classes.button}
        >
          Oui, me désinscrire
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ParkingDialog;
