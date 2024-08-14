import { Box, Container } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import createPersistedState from 'use-persisted-state';
import LoadIndicator from '../LoadIndicator';
import EditPlan from './EditPlan';
import PlanList from './PlanList';
import SpotPanel from './SpotPanel';
import usePlans from '../../hooks/usePlans';

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
      gridTemplateRows: '1fr auto',
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

const useUpdatedStack = createPersistedState('updateStack');
const useUndidStack = createPersistedState('undidStack');

function AdminPage () {
  const classes = useStyles();
  const { place } = useParams();

  const plans = usePlans();

  const defaultStack = plans
    .filter(({ Brouillon }) => !Brouillon)
    .reduce((acc, curr) => {
      const { Name } = curr;
      if (!Object.hasOwn(acc, Name)) {
        return {
          ...acc,
          [Name]: [],
        };
      }
      return acc;
    }, {});

  const [updateStack, setUpdatedStack] = useUpdatedStack({});
  const [undidStack, setUndidStack] = useUndidStack({});

  useEffect(() => {
    // Init the stack of update/undid modification, ordered by location
    if (!Object.keys(updateStack).length) {
      setUpdatedStack({
        ...defaultStack,
      });
    }
    if (!Object.keys(undidStack).length) {
      setUndidStack({
        ...defaultStack,
      });
    }
  }, [plans]);

  const [showPanel, setShowPanel] = React.useState(false);
  const [spot, setSelectedSpot] = React.useState({});
  const [updatedSpot, setUpdatedSpot] = React.useState({});

  useEffect(() => {
    // TODO : set panel info with new change
    setShowPanel(false);
  }, [place]);

  const handleClick = Spot => {
    setShowPanel(true);
    setSelectedSpot(Spot);
  };

  const onPanelClose = () => {
    setShowPanel(false);
  };

  const handleUpdate = (Spot, key) => {
    if (!key) return null;
    // Remove undid change when a new update is done
    setUndidStack({
      ...defaultStack,
    });
    return setUpdatedSpot(Spot);
  };

  return (
    <div className="adminPage">
      <LoadIndicator />
      <Container className={classes.container} maxWidth="unset">
        <Box className={classes.wrapper}>
          <Box className={classes.list}>
            <PlanList />
          </Box>
          <Box className={classes.plan}>
            {Boolean(place) && (
              <EditPlan
                handleClick={handleClick}
                updatedSpot={updatedSpot}
                selectedSpot={spot}
                panelOpen={showPanel}
              />
            )}
          </Box>
          <Box className={classes.editSpot}>
            {showPanel && (
              <SpotPanel
                spot={spot}
                onClose={onPanelClose}
                handleUpdate={handleUpdate}
              />
            )}
          </Box>
        </Box>
      </Container>
    </div>
  );
}

export default React.memo(AdminPage);
