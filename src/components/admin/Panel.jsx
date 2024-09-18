import { Close, Delete, Edit, OpenWith } from '@mui/icons-material';
import { alpha, Avatar, Box, Button, Card, CardContent, CardHeader, IconButton, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import createPersistedState from 'use-persisted-state';
import AdditionalsDialog from './AdditionalsDialog';
import AdditionalsPopup, { icons } from './AdditionalsPopup';
import { ADDITIONAL_ENTITY, DELETED_KEY, SPOT_ENTITY } from './const';
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
  delete: {
    width: '100%',
    margin: theme.spacing(1, 0, 0, 0),
    padding: theme.spacing(1.5, 0),
    border: `1.5px solid ${alpha(theme.palette.error.light, 0.5)}`,
    borderRadius: '8px',
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
    marginBottom: theme.spacing(3),
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

function Panel ({ entity, onClose, handleUpdate }) {
  const classes = useStyles();
  const [updateStack, setUpdateStack] = useUpdateStack();
  const [undidStack, setUndidStack] = useUndidStack();
  const [mapping] = useMapping();
  const { place } = useParams();
  const placeID = mapping[place];

  const { entity: entityType } = entity;

  const [entityInfo, setEntityInfo] = useState(entity);
  const [previousSpotInfo, setPreviousSpotInfo] = useState(entityInfo);

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
      setUndidStack({
        ...undidStack,
        [placeID]: [],
      });
      setUpdateStack({
        ...updateStack,
        [placeID]: [
          ...updateStack[placeID],
          editedAdditional,
        ],
      });
      setEntityInfo({
        ...editedAdditional,
      });
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
            <Button
              size="small"
              color="error"
              className={classes.delete}
              onClick={() => handleChange(DELETED_KEY, true)}
            >
              Supprimer Poste
            </Button>
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
            <Box className={classes.row}>
              <Button
                variant="contained"
                fullWidth
                disableElevation
                className={classes.btn}
                startIcon={<OpenWith />}
              >
                Déplacer
              </Button>
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
            </Box>
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
    </>
  );
}

export default React.memo(Panel);
