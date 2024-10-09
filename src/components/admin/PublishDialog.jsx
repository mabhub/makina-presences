import React, { useEffect, useState } from 'react';
import { Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import createPersistedState from 'use-persisted-state';
import usePlans from '../../hooks/usePlans';
import useSpots from '../../hooks/useSpots';
import LoadIndicator from '../LoadIndicator';
import { ADDITIONAL_ENTITY, SPOT_ENTITY } from './const';
import useAdditionals from '../../hooks/useAdditionals';

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
const useUndidStack = createPersistedState('undidStack');
const useMapping = createPersistedState('mapping');

function PublishDialog ({ open, plan, handleClose, isSecondary }) {
  const classes = useStyles();
  const [updateStack, setUpdateStack] = useUpdateStack();
  const [undidStack, setUndidStack] = useUndidStack();
  const [mapping] = useMapping();
  const placeID = mapping[plan.Name];
  const { setAdditionnal } = useAdditionals(placeID);

  const spotStack = updateStack[placeID]
    .filter(({ entity }) => entity === SPOT_ENTITY);
  const additionalStack = updateStack[placeID]
    .filter(({ entity }) => entity === ADDITIONAL_ENTITY);

  const { plans, updatePlan } = usePlans();
  const { setSpot } = useSpots(placeID);

  const [amountOfPlanUpdate, setAmountOfUpdate] = useState(0);

  useEffect(() => {
    if (!plan || amountOfPlanUpdate || plans.length === 0) return;
    const existingPlan = plans.find(({ id }) => id === plan.id);
    Object.keys(existingPlan).forEach(key => {
      if (typeof existingPlan[key] !== 'object' && existingPlan[key] !== plan[key]) {
        setAmountOfUpdate(previousValue => previousValue + 1);
      }
    });
  }, [plans]);

  const resetStack = () => {
    setUpdateStack({
      ...updateStack,
      [placeID]: [],
    });
    setUndidStack({
      ...undidStack,
      [placeID]: [],
    });
  };

  const setEntity = entity => {
    const { entity: entityType } = entity;

    if (entityType === SPOT_ENTITY) {
      return setSpot(entity);
    }

    if (entityType === ADDITIONAL_ENTITY) {
      return setAdditionnal(entity);
    }

    return null;
  };

  const handlePublication = () => {
    const lastModification = [
      ...updateStack[placeID]
        .reverse()
        .reduce((acc, curr) => {
          if (acc.map(({ Identifiant }) => Identifiant).includes(curr.Identifiant)) {
            return acc;
          }
          return [
            ...acc,
            curr,
          ];
        }, []),
    ];

    (amountOfPlanUpdate > 0 || isSecondary
      ? updatePlan(isSecondary ? { ...plan, Brouillon: false } : plan)
      : Promise.resolve())
      .then(() => (lastModification.length
        ? Promise.all(lastModification.map(entity => setEntity(entity)))
        : Promise.resolve()))
      .then(() => {
        resetStack();
        handleClose();
      });
  };

  return (
    <Dialog open={open}>
      <LoadIndicator
        sx={{
          position: 'absolute',
          opacity: 1,
        }}
      />
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
                  <Chip color={amountOfPlanUpdate ? 'primary' : 'default'} label={amountOfPlanUpdate} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Postes</TableCell>
                <TableCell align="right">
                  <Chip color={spotStack.length ? 'primary' : 'default'} label={spotStack.length} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Points d'Information</TableCell>
                <TableCell align="right">
                  <Chip color={additionalStack.length ? 'primary' : 'default'} label={additionalStack.length} />
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
