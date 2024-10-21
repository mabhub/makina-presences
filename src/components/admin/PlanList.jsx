import { Add, Delete, Edit } from '@mui/icons-material';
import { alpha, Box, Card, CardActionArea, Switch, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom/cjs/react-router-dom.min';
import createPersistedState from 'use-persisted-state';
import usePlans from '../../hooks/usePlans';
import PlanDialog from './PlanDialog';

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: 15,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(9px)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.Mui-checked': {
      transform: 'translateX(12px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor:
      theme.palette.mode === 'dark' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.25)',
    boxSizing: 'border-box',
  },
}));

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    padding: theme.spacing(0, 1, 2, 1),
    position: 'relative',
  },
  card: {
    border: `1px solid ${alpha(theme.palette.primary.fg, 0.2)}`,
    borderRadius: '10px',
    margin: theme.spacing(1, 0),
  },
  cardContent: {
    position: 'relative',
    padding: theme.spacing(2, 1, 2, 2),
    display: 'flex',
    justifyContent: 'space-between',
  },
  brouillon: {
    borderWidth: '3px',
    borderStyle: 'dashed',
  },
  selected: {
    borderWidth: '3px',
    borderColor: ` ${theme.palette.primary.main}`,
  },
  wrapper: {
    position: 'sticky',
    top: '0',
    zIndex: 1,
    width: '100%',
    background: theme.palette.mode === 'dark' ? '#121212' : '#fff',
    display: 'flex',
    alignItems: 'flex-end',
    padding: theme.spacing(2, 0, 1, 0),
  },
  addPlan: {
    width: '100%',
    borderRadius: '10px',
    border: 'unset',
    padding: theme.spacing(1.5, 0),
    background: alpha(theme.palette.primary.fg, 0.2),
    color: theme.palette.primary.fg,
    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      cursor: 'pointer',
      background: alpha(theme.palette.primary.fg, 0.4),
    },
  },
  actions: {
    display: 'flex',
  },
  actionButton: {
    alignContent: 'center',
    padding: theme.spacing(0.8),
    border: 'unset',
    background: 'unset',
    borderRadius: '10px',
    transition: 'all 100ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: '0.5',
    '&:hover': {
      opacity: '1',
      transition: 'all 100ms cubic-bezier(0.4, 0, 0.2, 1)',
      background: 'rgba(0, 0, 0, 0.05);',
      cursor: 'pointer',
    },
  },
  cardTitle: {
    maxWidth: '100%',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
}));

const usePlanUpdate = createPersistedState('planUpdate');
const useUpdateStack = createPersistedState('updateStack');
const useUndidStack = createPersistedState('undidStack');
const useMapping = createPersistedState('mapping');

const PlanList = () => {
  const classes = useStyles();
  const history = useHistory();
  const { place } = useParams();
  const [mapping, setMapping] = useMapping();

  const { setPlanWithImage } = usePlans();

  const [plans, setPlanUpdate] = usePlanUpdate([]);
  const [toUpdate, setToUpdate] = useState();
  const { plans: plansDB, deletePlan } = usePlans();

  const [updateStack, setUpdatedStack] = useUpdateStack();
  const [undidStack, setUndidStack] = useUndidStack();

  const uptdateTheStack = stack => plansDB
    .reduce((acc, curr) => {
      const { id } = curr;
      if (!Object.hasOwn(acc, id)) {
        return {
          ...acc,
          [id]: stack[id] ? stack[id] : [],
        };
      }
      return acc;
    }, {});

  // Is set from "plans" because Name's changes are stored locally
  const defaultMapping = plans
    .reduce((acc, curr) => {
      const { Name: key, id } = curr;
      if (!Object.hasOwn(acc, key)) {
        return {
          ...acc,
          [key]: id,
        };
      }
      return acc;
    }, {});

  useEffect(() => {
    if (plansDB.length > 0) {
      setPlanUpdate([...plansDB.map((plan, index) => ({
        ...plan,
        ...plans[index],
        plan: plan.plan,
      }))]);
      setUpdatedStack({
        ...uptdateTheStack(updateStack),
      });
      setUndidStack({
        ...uptdateTheStack(undidStack),
      });
    }
  }, [plansDB]);

  useEffect(() => {
    if (plans) {
      setMapping({ ...defaultMapping });
    }
  }, [plans]);

  const [isEdit, setIsEdit] = useState();
  const [dialogOpen, setDialogOpen] = useState();

  const handleDialog = (edit, id) => {
    setDialogOpen(true);
    setIsEdit(edit);
    if (edit) {
      setToUpdate(plans.find(({ id: planID }) => planID === id));
    }
  };

  const handleNew = props => {
    setDialogOpen(!dialogOpen);
    if (props) {
      const { name, planImage } = props;
      const newPlan = {
        Name: name,
        Brouillon: true,
      };
      setPlanWithImage(newPlan, planImage);
      history.push('/admin');
    }
  };

  const handleUpdate = props => {
    setDialogOpen(!dialogOpen);
    if (props) {
      const { old, newName, planImage } = props;
      const { Name: oldName } = old;
      // Update mapping et set local change (for name)
      setMapping({
        ...Object.keys(mapping).reduce((acc, curr) => {
          if (curr === oldName) {
            return {
              ...acc,
              [newName]: mapping[oldName],
            };
          }
          return {
            ...acc,
            [curr]: mapping[curr],
          };
        }, {}),
      });
      setPlanUpdate([
        ...plans.map(plan => ({
          ...plan,
          Name: plan.Name === oldName ? newName : plan.Name,
        })),
      ]);
      if (planImage) {
        setPlanWithImage(old, planImage);
      }
      history.push('/admin');
    }
  };

  const handleDelete = (event, name) => {
    deletePlan(plans.find(({ Name }) => Name === name));
    history.push('/admin');
    event.stopPropagation();
  };

  const handleBrouillon = name => {
    setPlanUpdate([
      ...plans.map(plan => {
        if (plan.Name === name) {
          return {
            ...plan,
            Brouillon: !plan.Brouillon,
          };
        }
        return plan;
      }),
    ]);
  };

  return (
    <>
      <Box className={classes.root}>
        <Box className={classes.wrapper}>
          <Box
            className={classes.addPlan}
            component="button"
            onClick={() => handleDialog(false)}
          >
            <Add />
          </Box>
        </Box>

        {plans.map(({ id, Name, Brouillon }) => {
          const isSelected = Name === place;
          return (
            <Card
              key={Name}
              elevation={0}
              className={clsx({
                [classes.card]: true,
                [classes.selected]: isSelected,
                [classes.brouillon]: Brouillon,
              })}
            >
              <CardActionArea
                className={classes.cardContent}
                onClick={() => history.push(`/admin/${Name}`)}
                disableRipple
              >
                <Typography
                  variant="h4"
                  fontWeight={isSelected ? 'bold' : 'unset'}
                  className={classes.cardTitle}
                >{Name}
                </Typography>

                {isSelected && (
                  <Box className={classes.actions}>
                    <Tooltip title="Actif">
                      <Box
                        className={classes.actionButton}
                        onClick={() => handleBrouillon(Name)}
                      >
                        <AntSwitch
                          checked={!Brouillon}
                        />
                      </Box>
                    </Tooltip>
                    <Tooltip title="Modifier">
                      <Box
                        className={classes.actionButton}
                        onClick={() => handleDialog(true, id)}
                      >
                        <Edit />
                      </Box>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <Box
                        className={classes.actionButton}
                        onClick={event => handleDelete(event, Name)}
                      >
                        <Delete />
                      </Box>
                    </Tooltip>
                  </Box>
                )}
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
      {dialogOpen && (
        <PlanDialog
          open={dialogOpen}
          onClose={isEdit ? handleUpdate : handleNew}
          edit={isEdit}
          plan={isEdit ? toUpdate : ''}
        />
      )}
    </>
  );
};

export default React.memo(PlanList);
