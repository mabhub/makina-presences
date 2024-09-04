import React, { useEffect, useState } from 'react';
import { Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import createPersistedState from 'use-persisted-state';
import usePlans from '../../hooks/usePlans';

const useStyles = makeStyles(theme => ({
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  warning: {
    marginTop: theme.spacing(2),
  },
  tableCellHead: {
    '&.MuiTableCell-root': {
      borderWidth: '0.2em',
      paddingBottom: theme.spacing(1.2),
      fontWeight: '600',
    },
  },
}));

const useUpdateStack = createPersistedState('updateStack');
const useMapping = createPersistedState('mapping');

function PublishDialog ({ open, plan, handleClose, isSecondary }) {
  const classes = useStyles();
  const [updateStack] = useUpdateStack();
  const [mapping] = useMapping();
  const placeID = mapping[plan.Name];

  const { plans, updatePlan } = usePlans();

  const [amountOfUpdate, setAmountOfUpdate] = useState(0);

  useEffect(() => {
    if (!plan || amountOfUpdate) return;
    const existingPlan = plans.find(({ id }) => id === plan.id);
    Object.keys(existingPlan).forEach(key => {
      if (typeof existingPlan[key] !== 'object' && existingPlan[key] !== plan[key]) {
        setAmountOfUpdate(previousValue => previousValue + 1);
      }
    });
  }, [plans]);

  const handlePublication = () => {
    updatePlan(isSecondary
      ? { ...plan, Brouillon: false }
      : plan);
    handleClose();
  };

  return (
    <Dialog open={open}>
      <DialogTitle><strong>{isSecondary ? 'Publication des Modifications' : 'Enregistrement des Modifications'}</strong></DialogTitle>
      <DialogContent className={classes.content}>
        L'ensemble des modifications effectuées depuis la dernière publication vont
        être enregistrées dans la base.
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  className={classes.tableCellHead}
                >Type de modifications
                </TableCell>
                <TableCell
                  className={classes.tableCellHead}
                  align="right"
                >Nombre
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Plan</TableCell>
                <TableCell align="right">
                  <Chip color={amountOfUpdate ? 'primary' : 'default'} label={amountOfUpdate} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Postes</TableCell>
                <TableCell align="right">
                  <Chip color={updateStack[placeID].length ? 'primary' : 'default'} label={updateStack[placeID].length} />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {isSecondary && (
        <Alert severity="warning" className={classes.warning}>
          Attention, <strong>{plan.Name} est inactif</strong>.
          Ces locaux vont passer actif et vont donc devenir visibles par tous les utilisateurs.
        </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Annuler</Button>
        <Button onClick={handlePublication}>{isSecondary ? 'Publier' : 'Enregistrer'} </Button>
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(PublishDialog);
