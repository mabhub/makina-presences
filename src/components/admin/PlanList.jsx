import { Add, Delete, Edit } from '@mui/icons-material';
import { Box, Card, CardActionArea, Switch, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom/cjs/react-router-dom.min';
import createPersistedState from 'use-persisted-state';
import NewPlanDialog from './NewPlanDialog';
import PlanNameDialog from './PlanNameDialog';

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
    padding: theme.spacing(2, 1),
    position: 'relative',
  },
  card: {
    border: theme.palette.mode === 'light' ? '1px solid #00000030' : '1px solid #ededed30',
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
    border: '3px dashed #00000030',
  },
  selected: {
    borderWidth: '3px',
    borderColor: ` ${theme.palette.primary.main}`,
  },
  wrapper: {
    background: 'linear-gradient( rgba(255,255,255,1) 88%, rgba(9,9,121,0) 100%)',
    position: 'sticky',
    top: theme.spacing(2),
    zIndex: 1,
    width: '100%',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: `-${theme.spacing(2)}`,
      left: 0,
      width: '100%',
      height: `${theme.spacing(2)}`,
      background: 'white',
    },
  },
  addPlan: {
    width: '100%',
    borderRadius: '10px',
    border: 'unset',
    padding: theme.spacing(1.5, 0),
    marginBottom: theme.spacing(1),
    opacity: 0.5,
    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      cursor: 'pointer',
      opacity: 1,
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

function PlanList () {
  const classes = useStyles();
  const history = useHistory();
  const { place } = useParams();

  const [plans, setPlanUpdate] = usePlanUpdate([]);
  const [dialogNewOpen, setDialogNewOpen] = useState(false);
  const [dialogUpdateOpen, setDialogUpdateOpen] = useState(false);
  const [planName, setPlanName] = useState('');

  const handleNewClose = (name, plan) => {
    setDialogNewOpen(!dialogNewOpen);
    if (name && plan) {
      setPlanUpdate([
        ...plans,
        {
          Name: name,
          Postes: [],
          plan: [{ url: plan }],
          Brouillon: false,
        },
      ]);
    }
  };

  const handleUpdateClose = (oldName, newName) => {
    setDialogUpdateOpen(!dialogUpdateOpen);
    setPlanUpdate([
      ...plans.map(plan => {
        if (plan.Name === oldName) {
          return {
            ...plan,
            Name: newName,
          };
        }
        return plan;
      }),
    ]);
    history.push('/admin');
  };

  const [updateStack, setUpdatedStack] = useUpdateStack();
  const [undidStack, setUndidStack] = useUndidStack();

  const uptdateTheStack = stack => plans.reduce((acc, curr) => {
    const { Name } = curr;
    if (!Object.hasOwn(acc, Name)) {
      return {
        ...acc,
        [Name]: stack[Name] ? stack[Name] : [],
      };
    }
    return acc;
  }, {});

  useEffect(() => {
    setTimeout(() => {
      setUpdatedStack({
        ...uptdateTheStack(updateStack),
      });
      setUndidStack({
        ...uptdateTheStack(undidStack),
      });
    }, 0);
  }, [plans]);

  const handleDelete = (event, name) => {
    setPlanUpdate([
      ...plans.filter(({ Name }) => Name !== name),
    ]);
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
            onClick={() => setDialogNewOpen(!dialogNewOpen)}
          >
            <Add />
          </Box>
        </Box>

        {plans.map(({ Name, Brouillon }) => {
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
                        onClick={() => {
                          setDialogUpdateOpen(!dialogUpdateOpen);
                          setPlanName(Name);
                        }}
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
      {dialogNewOpen && (
        <NewPlanDialog
          open={dialogNewOpen}
          onClose={handleNewClose}
        />
      )}
      {dialogUpdateOpen && (
        <PlanNameDialog
          open={dialogUpdateOpen}
          onClose={handleUpdateClose}
          planName={planName}
        />
      )}
    </>
  );
}

export default React.memo(PlanList);
