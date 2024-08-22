import { Box, Container } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import createPersistedState from 'use-persisted-state';
import LoadIndicator from '../LoadIndicator';
import EditPlan from './EditPlan';
import PlanList from './PlanList';
import SpotPanel, { DELETED_KEY } from './SpotPanel';
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
    // background: 'orange',
    border: '2px solid #00000015',
  },
}));

const useUndidStack = createPersistedState('undidStack');
const usePlanUpdate = createPersistedState('planUpdate');

function AdminPage () {
  const classes = useStyles();
  const { place } = useParams();

  const [planUpdate] = usePlanUpdate([]);

  const plans = usePlans();

  const defaultStack = plans
    // .concat(planUpdate)
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

  // console.log(plans);
  // console.log(defaultStack);

  const [undidStack, setUndidStack] = useUndidStack({});

  const initStacks = () => {
    if (Object.keys(defaultStack).length > 0) {
      localStorage.setItem('updateStack', JSON.stringify({ ...defaultStack }));
      localStorage.setItem('undidStack', JSON.stringify({ ...defaultStack }));
    }
  };

  const areStacksValid = typeof localStorage.updateStack !== 'undefined'
  && typeof localStorage.undidStack !== 'undefined';

  const [showPanel, setShowPanel] = React.useState(false);
  const [spot, setSelectedSpot] = React.useState({});
  const [updatedSpot, setUpdatedSpot] = React.useState({});

  useEffect(() => {
    // TODO : set panel info with undo/redo changes
    setShowPanel(false);
  }, [place]);

  const handleClick = Spot => {
    setShowPanel(true);
    setSelectedSpot(Spot);
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

  const handleUpdate = (Spot, key) => {
    if (!key) return null;
    if (key === DELETED_KEY) setShowPanel(false);
    resestUndidStack();
    return setUpdatedSpot(Spot);
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
      )}
    </div>
  );
}

export default React.memo(AdminPage);
