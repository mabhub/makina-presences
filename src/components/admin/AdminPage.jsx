import { Box, Container } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import createPersistedState from 'use-persisted-state';
import LoadIndicator from '../LoadIndicator';
import EditPlan from './EditPlan';
import PlanList from './PlanList';
import Panel, { DELETED_KEY } from './Panel';
import usePlans from '../../hooks/usePlans';

const useStyles = makeStyles(theme => ({
  container: {
    height: '100dvh',
    padding: theme.spacing(0),
  },
  wrapper: {
    height: '100dvh',
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
    overflow: 'auto',
    scrollbarWidth: 'thin',
  },
  plan: {
    gridArea: 'b',
  },
  editSpot: {
    gridArea: 'c',
    border: '2px solid #00000015',
    minWidth: '330px',
  },
}));

const useUndidStack = createPersistedState('undidStack');
const useUpdateStack = createPersistedState('updateStack');
const useMapping = createPersistedState('mapping');

function AdminPage () {
  const classes = useStyles();
  const { place } = useParams();

  const { plans } = usePlans();

  const defaultStack = plans
    .reduce((acc, curr) => {
      const { id } = curr;
      if (!Object.hasOwn(acc, id)) {
        return {
          ...acc,
          [id]: [],
        };
      }
      return acc;
    }, {});

  const [undidStack, setUndidStack] = useUndidStack({});
  const [updateStack] = useUpdateStack({});
  const [mapping] = useMapping();

  const initStacks = () => {
    if (Object.keys(defaultStack).length > 0) {
      localStorage.setItem('updateStack', JSON.stringify({ ...defaultStack }));
      localStorage.setItem('undidStack', JSON.stringify({ ...defaultStack }));
      localStorage.setItem('planUpdate', JSON.stringify([...plans]));
    }
  };

  const areStacksValid = typeof localStorage.updateStack !== 'undefined'
  && typeof localStorage.undidStack !== 'undefined'
  && typeof localStorage.planUpdate !== 'undefined';

  const [showPanel, setShowPanel] = React.useState(false);
  const [entity, setSelectedEntity] = React.useState({});
  const [updatedSpot, setUpdatedSpot] = React.useState({});

  useEffect(() => {
    setShowPanel(false);
  }, [place]);

  useEffect(() => {
    if (place && updateStack[mapping[place]].findLast(({ id }) => id === entity.id)) {
      const lastState = updateStack[mapping[place]].findLast(({ id }) => id === entity.id);
      setShowPanel(!Object.hasOwn(lastState, DELETED_KEY));
    }
  }, [updateStack]);

  const handleClick = entitySelected => {
    if (!entitySelected) {
      setShowPanel(false);
      setSelectedEntity();
      return;
    }
    setShowPanel(true);
    setSelectedEntity({ ...entitySelected });
  };

  const onPanelClose = () => {
    setShowPanel(false);
  };

  const resestUndidStack = () => {
    setUndidStack(Object.keys(undidStack)
      .reduce((acc, curr) => ({
        ...acc,
        [curr]: [],
      }), {}));
  };

  const handleUpdate = (Spot, diffs) => {
    resestUndidStack();
    const [key] = diffs;
    if (key === DELETED_KEY) setShowPanel(false);
    setUpdatedSpot(Spot);
  };

  return (
    <div className="adminPage">
      <LoadIndicator />

      {!areStacksValid && (
        initStacks()
      )}

      {areStacksValid && (
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
                  setUpdatedSpot={setUpdatedSpot}
                  panelOpen={showPanel}
                />
              )}
            </Box>
            <Box className={classes.editSpot}>
              {showPanel && (
                <Panel
                  entity={entity}
                  onClose={onPanelClose}
                  handleUpdate={handleUpdate}
                />
              )}
            </Box>
          </Box>
        </Container>
      )}
    </div>
  );
}

export default React.memo(AdminPage);
