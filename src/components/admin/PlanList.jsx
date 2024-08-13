import { Box, Card, CardActionArea, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom/cjs/react-router-dom.min';
import usePlans from '../../hooks/usePlans';

const useStyles = makeStyles(theme => {
  const maxWidth = mq => `@media (max-width: ${theme.breakpoints.values[mq]}px)`;

  return {
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
  };
});

function PlanList () {
  const classes = useStyles();
  const plans = usePlans().filter(({ Brouillon }) => !Brouillon);
  const history = useHistory();
  const { place } = useParams();

  return (
    <Box className={classes.root}>
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
  );
}

export default React.memo(PlanList);
