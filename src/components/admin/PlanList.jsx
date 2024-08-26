import { Add, Delete, Edit } from '@mui/icons-material';
import { Box, Card, CardActionArea, Tooltip, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom/cjs/react-router-dom.min';
import createPersistedState from 'use-persisted-state';
import usePlans from '../../hooks/usePlans';
import NewPlanDialog from './NewPlanDialog';

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
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
  },
  selected: {
    border: `3px solid ${theme.palette.primary.main}`,
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

  const [planUpdate, setPlanUpdate] = usePlanUpdate([]);
  // const plans = usePlans()
  // .concat(planUpdate)
  // .filter(({ Brouillon }) => !Brouillon);

  // console.log(plans);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClose = (name, plan) => {
    setDialogOpen(!dialogOpen);
    if (name && plan) {
      setPlanUpdate([
        ...planUpdate,
        {
          Name: name,
          Postes: [],
          plan: [{ url: plan }],
          Brouillon: false,
        },
      ]);
    }
  };

  const [updateStack, setUpdatedStack] = useUpdateStack();
  const [undidStack, setUndidStack] = useUndidStack();

  const uptdateTheStack = stack => planUpdate.reduce((acc, curr) => {
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
  }, [planUpdate]);

  const handleDelete = (event, name) => {
    setPlanUpdate([
      ...planUpdate.filter(({ Name }) => Name !== name),
    ]);
    history.push('/admin');
    event.stopPropagation();
  };

  return (
    <>
      <Box className={classes.root}>
        <Box className={classes.wrapper}>
          <Box
            className={classes.addPlan}
            component="button"
            onClick={() => setDialogOpen(!dialogOpen)}
          >
            <Add />
          </Box>
        </Box>

        {planUpdate.map(({ Name }) => {
          const isSelected = Name === place;
          return (
            <Card
              key={Name}
              elevation={0}
              className={clsx({
                [classes.card]: true,
                [classes.selected]: isSelected,
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
        <NewPlanDialog
          open={dialogOpen}
          onClose={handleClose}
        />
      )}
    </>
  );
}

export default React.memo(PlanList);
