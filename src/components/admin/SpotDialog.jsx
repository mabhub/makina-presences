import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import createPersistedState from 'use-persisted-state';
import usePlans from '../../hooks/usePlans';
import useSpots from '../../hooks/useSpots';
import SpotForm from './SpotForm';

export const CREATED_KEY = 'created';

const useMapping = createPersistedState('mapping');

function SpotDialog ({ open, onClose, initialSpot }) {
  const { place } = useParams();
  const [mapping] = useMapping();
  const placeID = mapping[place];
  const { plans } = usePlans(placeID);
  const [spotInfo, setSpotInfo] = useState(initialSpot || {
    Bloqué: false,
    Cumul: false,
    Description: null,
    Identifiant: null,
    Plan: plans.filter(({ id }) => id === placeID),
    Type: null,
    x: 0,
    y: 0,
  });

  const [idValid, setIdValid] = useState(true);

  const spotIds = useSpots(mapping[place]).spots.map(({ Identifiant }) => Identifiant);
  const handleChange = (key, value) => {
    if (key === 'Identifiant') {
      setIdValid(!spotIds.includes(value));
    }

    setSpotInfo({
      ...spotInfo,
      [key]: value,
    });
  };

  const canSubmit = spotInfo.Identifiant
    && spotInfo.Type
    && !spotIds.includes(spotInfo.Identifiant);

  const handleSubmit = () => {
    onClose({
      ...spotInfo,
      [CREATED_KEY]: true,
    });
  };

  return (
    <Dialog open={open}>
      <DialogTitle><strong>{!initialSpot ? 'Nouveau Poste' : `Duplication depuis ${initialSpot.Identifiant}`}</strong></DialogTitle>
      <DialogContent sx={{ overflow: 'visible' }} dividers>
        <SpotForm
          edit={false}
          isDuplicating={initialSpot}
          isIDValid={idValid}
          spotInfo={spotInfo}
          handleChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => (onClose(null))}>Annuler</Button>
        <Button onClick={handleSubmit} disabled={!canSubmit}>Créer</Button>
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(SpotDialog);
