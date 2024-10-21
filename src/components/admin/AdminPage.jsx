import { alpha, Box, Container } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import createPersistedState from 'use-persisted-state';
import usePlans from '../../hooks/usePlans';
import LoadIndicator from '../LoadIndicator';
import EditPlan from './EditPlan';
import Panel from './Panel';
import PlanList from './PlanList';
import { DELETED_KEY } from './const';

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
    borderRight: `2px solid ${alpha(theme.palette.primary.fg, 0.2)}`,
    overflow: 'auto',
    scrollbarWidth: 'thin',
    colorScheme: theme.palette.mode,
  },
  plan: {
    gridArea: 'b',
    display: 'flex',
    flexDirection: 'column',
  },
  panel: {
    gridArea: 'c',
    minWidth: '370px',
  },
}));

const useUndidStack = createPersistedState('undidStack');
const useUpdateStack = createPersistedState('updateStack');
const useMapping = createPersistedState('mapping');

const AdminPage = () => {
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
    if (place && entity && updateStack[mapping[place]].findLast(({ id }) => id === entity.id)) {
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
                  entitySelected={entity}
                />
              )}
            </Box>
            <Box className={classes.panel}>
              {showPanel && (
                <Panel
                  entity={entity}
                  onClose={onPanelClose}
                  handleUpdate={handleUpdate}
                  onSelect={handleClick}
                />
              )}
            </Box>
          </Box>
        </Container>
      )}
    </div>
  );
};

export default React.memo(AdminPage);
