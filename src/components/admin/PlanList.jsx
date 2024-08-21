import { Box, Card, CardActionArea, IconButton, Tooltip, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { Add } from '@mui/icons-material';
import usePlans from '../../hooks/usePlans';
import NewPlanDialog from './NewPlanDialog';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    padding: theme.spacing(2, 1),
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
}));

function PlanList () {
  const classes = useStyles();
  const plans = usePlans().filter(({ Brouillon }) => !Brouillon);
  const history = useHistory();
  const { place } = useParams();

  console.log(plans);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClose = (name, plan) => {
    setDialogOpen(!dialogOpen);
    if (name && plan) {
      // console.log(name, plan);
    }
  };

  return (
    <>
      <Box className={classes.root}>
        <Box
          className={classes.addPlan}
          component="button"
          onClick={() => setDialogOpen(!dialogOpen)}
        >
          <Add />
        </Box>
        {plans.map(({ Name }) => {
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
              <CardActionArea className={classes.cardContent} onClick={() => history.push(`/admin/${Name}`)}>
                <Typography
                  variant="h4"
                  fontWeight={isSelected ? 'bold' : 'unset'}
                >{Name}
                </Typography>
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
