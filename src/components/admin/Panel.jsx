import { Close, ContentCopy, Delete, Edit } from '@mui/icons-material';
import { alpha, Avatar, Box, Button, Card, CardContent, CardHeader, IconButton, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import createPersistedState from 'use-persisted-state';
import AdditionalsDialog from './AdditionalsDialog';
import AdditionalsPopup, { icons } from './AdditionalsPopup';
import { ADDITIONAL_ENTITY, CREATED_KEY, DELETED_KEY, SPOT_ENTITY } from './const';
import SpotDialog from './SpotDialog';
import SpotForm from './SpotForm';

const useStyles = makeStyles(theme => ({
  cardEdit: {
    paddingBottom: theme.spacing(0.5),
  },
  textField: {
    '& .MuiOutlinedInput-input': {
      padding: theme.spacing(0.5, 1),
    },
    width: '75px',
    marginLeft: theme.spacing(0.5),
  },
  cardContent: {
    padding: theme.spacing(0, 2),
  },
  preview: {
    background: alpha(theme.palette.primary.fg, 0.1),
    width: '100%',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(5, 2),
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: theme.spacing(3),
  },
  row: {
    display: 'flex',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  btn: {
    textTransform: 'none',
    padding: theme.spacing(0.5),
    background: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    borderRadius: '6px',
    '&:hover': {
      color: 'white',
    },
  },
  btnDelete: {
    background: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.main,
    border: 'unset',
  },
}));

const useUpdateStack = createPersistedState('updateStack');
const useUndidStack = createPersistedState('undidStack');
const useMapping = createPersistedState('mapping');

function Panel ({ entity, onClose, handleUpdate, onSelect }) {
  const classes = useStyles();
  const [updateStack, setUpdateStack] = useUpdateStack();
  const [undidStack, setUndidStack] = useUndidStack();
  const [mapping] = useMapping();
  const { place } = useParams();
  const placeID = mapping[place];

  const { entity: entityType } = entity;

  const [entityInfo, setEntityInfo] = useState(entity);
  const [previousSpotInfo, setPreviousSpotInfo] = useState(entityInfo);

  const [isDuplicating, setIsDuplicating] = useState(false);

  const resestUndidStack = () => {
    setUndidStack({
      ...undidStack,
      [placeID]: [],
    });
  };

  useEffect(() => {
    setEntityInfo({
      ...entity,
    });
    setPreviousSpotInfo({});
  }, [entity]);

  const handleChange = (key, value) => {
    setPreviousSpotInfo({
      ...entityInfo,
    });
    setEntityInfo({
      ...entityInfo,
      [key]: value,
    });
  };

  useEffect(() => {
    const diffs = [
      ...new Set([
        ...Object.keys(previousSpotInfo),
        ...Object.keys(entityInfo),
      ]),
    ].filter(k =>
      previousSpotInfo[k] !== entityInfo[k]
      && previousSpotInfo.Identifiant === entityInfo.Identifiant);

    if (diffs.length === 1) {
      handleUpdate(entityInfo, diffs);
    }
  }, [entityInfo]);

  const handleDuplication = newSpot => {
    if (newSpot) {
      const { id, ...clonedSpot } = {
        ...newSpot,
        x: parseInt(newSpot.x, 10) + 15,
        y: parseInt(newSpot.y, 10) + 15,
        [CREATED_KEY]: true,
      };
      resestUndidStack();
      setUpdateStack({
        ...updateStack,
        [placeID]: [
          ...updateStack[placeID],
          clonedSpot,
        ],
      });
      onSelect(clonedSpot);
    }
    setIsDuplicating(false);
  };

  const getAdditionalHeader = () => {
    const { Fixe, Tache } = entity;
    if (Fixe) return 'Fixe';
    if (Tache) return 'Tâche';
    return 'Pop-up';
  };

  const getAdditionalIcon = () => {
    const { icon } = entity;
    const Icone = icons[icon];
    return <Icone />;
  };

  const [additionalOpen, setAdditionalOpen] = useState(false);

  const handleAdditionalUpdate = editedAdditional => {
    setAdditionalOpen(false);
    if (editedAdditional) {
      resestUndidStack();
      setUpdateStack({
        ...updateStack,
        [placeID]: [
          ...updateStack[placeID],
          editedAdditional,
        ],
      });
      onSelect(editedAdditional);
    }
  };

  return (
    <>
      <Card className={classes.cardEdit} elevation={0}>
        {entityType === SPOT_ENTITY && (
        <>
          <CardHeader
            avatar={(
              <Avatar sx={{
                backgroundColor: theme => theme.palette.primary.bg,
                color: theme => theme.palette.primary.fg,
                border: '2px solid',
                borderColor: entityInfo.Type?.color?.replace('-', ''),
              }}
              >
                {entity.Identifiant}
              </Avatar>
            )}
            title={(
              <Typography variant="h6">
                Configuration
              </Typography>
            )}
            subheader={`Poste ${entity.Identifiant}`}
            action={(
              <IconButton onClick={() => onClose(false)}>
                <Close />
              </IconButton>
            )}
          />
          <CardContent>
            <SpotForm
              edit
              spotInfo={entityInfo}
              handleChange={handleChange}
            />
            <Box className={classes.actions}>
              <Box className={classes.row}>
                <Button
                  variant="contained"
                  fullWidth
                  disableElevation
                  className={classes.btn}
                  startIcon={<ContentCopy />}
                  onClick={() => setIsDuplicating(true)}
                >
                  Dupliquer
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  startIcon={<Delete />}
                  className={clsx([classes.btn], [classes.btnDelete])}
                  disableElevation
                  onClick={() => handleChange(DELETED_KEY, true)}
                >
                  Supprimer
                </Button>
              </Box>
            </Box>
          </CardContent>
        </>
        )}
        {entityType === ADDITIONAL_ENTITY && (
        <>
          <CardHeader
            title={(
              <Typography variant="h6">
                {getAdditionalHeader()}
              </Typography>
          )}
            subheader="Point d'information"
            avatar={(
              <Avatar>
                {getAdditionalIcon()}
              </Avatar>
          )}
            action={(
              <IconButton onClick={() => onClose(false)}>
                <Close />
              </IconButton>
          )}
          />
          <CardContent className={classes.cardContent}>
            <Box className={classes.preview}>
              <AdditionalsPopup
                info={entity}
                showPin={false}
              />
            </Box>
            <Box className={classes.actions}>
              <Box className={classes.row}>
                <Button
                  variant="contained"
                  fullWidth
                  disableElevation
                  className={classes.btn}
                  startIcon={<Edit />}
                  onClick={() => setAdditionalOpen(true)}
                >
                  Modifier
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  startIcon={<Delete />}
                  className={clsx([classes.btn], [classes.btnDelete])}
                  disableElevation
                  onClick={() => handleChange(DELETED_KEY, true)}
                >
                  Supprimer
                </Button>
              </Box>
            </Box>
          </CardContent>
        </>
        )}
      </Card>
      {additionalOpen && (
        <AdditionalsDialog
          open={additionalOpen}
          baseInfo={entity}
          onClose={handleAdditionalUpdate}
        />
      )}
      {isDuplicating && (
        <SpotDialog
          open={isDuplicating}
          onClose={handleDuplication}
          initialSpot={entity}
        />
      )}
    </>
  );
}

export default React.memo(Panel);
