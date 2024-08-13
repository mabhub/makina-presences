import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { Box, Container } from '@mui/material';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import PlanList from './PlanList';
import EditPlan from './EditPlan';
import LoadIndicator from '../LoadIndicator';
import SpotPanel from './SpotPanel';

const useStyles = makeStyles(theme => {
  const maxWidth = mq => `@media (max-width: ${theme.breakpoints.values[mq]}px)`;

  return {
    container: {
      height: '100dvh',
      padding: theme.spacing(0),
    },
    wrapper: {
      height: '100%',
      display: 'grid',
      gridTemplateAreas: `
        "a b b"
        "c b b"
        "C b b"`,
      gridTemplateColumns: '2fr 8fr ',
      gridTemplateRows: ' 5fr 4fr',
    },
    list: {
      gridArea: 'a',
      borderRight: '2px solid #00000015',
    },
    plan: {
      gridArea: 'b',
    },
    editSpot: {
      gridArea: 'c',
      // background: 'orange',
      border: '2px solid #00000015',
    },
  };
});

function AdminPage () {
  const classes = useStyles();
  const { place } = useParams();

  const [showPanel, setShowPanel] = React.useState(false);
  const [spot, setSelectedSpot] = React.useState({});
  const [updatedSpot, setUpdatedSpot] = React.useState({});

  const handleClick = Spot => {
    setShowPanel(!showPanel);
    setSelectedSpot(Spot);
  };

  const handleUpdate = Spot => {
    console.log('admin page');
    setUpdatedSpot(Spot);
  };

  return (
    <div className="adminPage">
      <LoadIndicator />
      <Container className={classes.container} maxWidth="unset">
        <Box className={classes.wrapper}>
          <Box className={classes.list}>
            <PlanList />
          </Box>
          <Box className={classes.editSpot}>
            {showPanel && (
              <SpotPanel spot={spot} onClose={setShowPanel} handleUpdate={handleUpdate} />
            )}
          </Box>
          <Box className={classes.plan}>
            {Boolean(place) && (
              <EditPlan handleClick={handleClick} updatedSpot={updatedSpot} />
            )}
          </Box>
        </Box>
      </Container>
    </div>
  );
}

export default React.memo(AdminPage);
