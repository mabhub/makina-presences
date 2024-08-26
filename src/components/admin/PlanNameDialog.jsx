import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import React, { useState } from 'react';
import createPersistedState from 'use-persisted-state';

const usePlanUpdate = createPersistedState('planUpdate');

function PlanNameDialog ({ open, onClose, planName }) {
  const [planUpdate] = usePlanUpdate();
  const [nameValid, setNameValid] = useState(true);
  const [name, setName] = useState(planName);

  const handleChange = event => {
    setName(event.target.value);
    setNameValid(
      !planUpdate
        .filter(({ Name }) => Name !== planName)
        .map(({ Name }) => Name).includes(event.target.value),
    );
  };

  return (
    <Dialog open={open}>
      <DialogTitle>Modification du plan</DialogTitle>
      <DialogContent dividers>
        <TextField
          size="small"
          label="Nom"
          value={name}
          error={!nameValid}
          helperText={nameValid ? '' : 'Ce nom existe déjà'}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Annuler</Button>
        <Button onClick={() => onClose(planName, name)}>Enregistrer</Button>
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(PlanNameDialog);
