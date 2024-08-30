import { Close } from '@mui/icons-material';
import { alpha, Avatar, Button, Card, CardContent, CardHeader, IconButton, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect, useState } from 'react';
import SpotForm from './SpotForm';

const useStyles = makeStyles(theme => ({
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
}));

export const DELETED_KEY = 'deleted';

function SpotPanel ({ spot, onClose, handleUpdate }) {
  const classes = useStyles();

  const { Identifiant } = spot;

  const [spotInfo, setSpotInfo] = useState(spot);
  const [previousSpotInfo, setPreviousSpotInfo] = useState(spotInfo);

  useEffect(() => {
    setSpotInfo({
      ...spot,
    });
    setPreviousSpotInfo({});
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
    const diffs = [
      ...new Set([
        ...Object.keys(previousSpotInfo),
        ...Object.keys(spotInfo),
      ]),
    ].filter(k =>
      previousSpotInfo[k] !== spotInfo[k]
      && previousSpotInfo.Identifiant === spotInfo.Identifiant);

    if (diffs.length === 1) {
      handleUpdate(spotInfo, diffs);
    }
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
      <CardContent>
        <SpotForm
          edit
          spotInfo={spotInfo}
          handleChange={handleChange}
        />
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
