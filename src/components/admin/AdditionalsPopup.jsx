import { Close, Delete, DirectionsBike, DirectionsCar, DryCleaning, HelpOutline } from '@mui/icons-material';
import { alpha, Box, Button, Divider, Fab, Link, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { useState } from 'react';

import { grey } from '@mui/material/colors';
import Rehype2react from 'rehype-react';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

const useStyles = makeStyles(theme => ({
  root: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1),

    minWidth: '200px',
    maxWidth: '300px',
  },

  additional: {
    backgroundColor: theme.palette.primary,
    boxShadow: 'none',
    width: 20,
    minWidth: 20,
    height: 20,
    minHeight: 20,
    zIndex: 1,
    '&:hover': {
      background: alpha(theme.palette.primary.fg, 0.2),
    },
    '&:disabled': {
      backgroundColor: theme.palette.primary.bg,
    },
  },
  selectedAdditional: {
    backgroundImage: 'linear-gradient(45deg, #ffffff 20%, #e6e6e6 20%, #e6e6e6 50%, #ffffff 50%, #ffffff 70%, #e6e6e6 70%, #e6e6e6 100%)',
    backgroundSize: '7.07px 7.07px',
  },
  icon: {
    color: theme.palette.primary.fg,
    width: '100%',
    height: '100%',
  },
  badges: {
    backgroundColor: theme.palette.primary.bg,
    position: 'absolute',
    top: '-70%',
    textTransform: 'none',
    padding: theme.spacing(0.5),
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'scale(0.6)',
    transformOrigin: 'right',
    color: 'black',
  },
  triBadge: {
    border: theme.palette.mode === 'light' ? '1px solid #00000030' : '1px solid #ededed30',
  },

  additionalContent: {
    width: '100%',
    minHeight: '50px',
    backgroundColor: theme.palette.primary.bg,
    padding: theme.spacing(1.5),
    borderRadius: '6px',
  },
  selectedAdditionalContent: {
    borderColor: `${theme.palette.primary.main} !important`,
  },
  mountedAdditionalContent: {
    zIndex: 2,
    minWidth: '200px',
    maxWidth: '300px',
  },
  fixed: {
    border: theme.palette.mode === 'light' ? '1px solid #00000030' : '1px solid #ededed30',
  },
  mountedFixed: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
  popup: {
    boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  closeIcon: {
    width: 20,
    height: 20,
    marginLeft: theme.spacing(0.5),
    padding: theme.spacing(0.1),
    borderRadius: '4px',
  },
  mountedCloseIcon: {
    '&:hover': {
      cursor: 'pointer',
      background: theme.palette.mode === 'light' ? '#00000010' : '#ededed30',
    },
  },
  triList: {
    marginTop: theme.spacing(0.5),
    display: 'flex',
    width: 'fit-content',
    flexWrap: 'wrap',
    gap: '2px',
  },
  text: {
    wordBreak: 'break-word',
  },
  tri: {
    fontSize: '0.5rem',
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    alignContent: 'center',
    background: theme.palette.mode === 'light' ? grey[200] : grey[800],
    borderRadius: 99,
    color: theme.palette.mode === 'light' ? 'dark' : 'white',
  },
  btn: {
    marginTop: theme.spacing(1),
    textTransform: 'none',
    padding: theme.spacing(0.1),
    width: '50%',
    display: 'block',
    marginLeft: 'auto',
    '&:disabled': {
      background: theme.palette.primary.main,
      color: 'white',
    },
  },
}));

export const icons = {
  default: HelpOutline,
  delete: Delete,
  car: DirectionsCar,
  bike: DirectionsBike,
  dry: DryCleaning,
};

function AdditionalsPopup ({
  info,
  mounted = false,
  showPin = true,
  onClick = () => {},
  isSelected,
}) {
  const classes = useStyles();

  const { Titre, Description, Tache, Fixe, tris = !mounted && ['amz'], icon } = info;
  const trisLeft = tris.length - 3;

  const body = 'body2';
  const processor = React.useMemo(
    () => unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(remarkGfm)
      .use(Rehype2react, {
        createElement: React.createElement,
        components: {
          h1: props => <Typography variant="h1" {...props} />,
          h2: props => <Typography variant="h2" {...props} />,
          h3: props => <Typography variant="h3" {...props} />,
          h4: props => <Typography variant="h4" {...props} />,
          h5: props => <Typography variant="h5" {...props} />,
          h6: props => <Typography variant="h6" {...props} />,
          hr: ({ className: cn, ...props }) =>
            <Divider className={clsx(cn, classes.divider)} {...props} />,
          p: props => <Typography variant={body} {...props} />,
          li: props => <Typography variant={body} component="li" {...props} />,
          a: props => <Link {...props} />,
          table: props => <Table {...props} />,
          thead: props => <TableHead {...props} />,
          tbody: props => <TableBody {...props} />,
          tr: props => <TableRow {...props} />,
          td: props => <TableCell {...props} />,
          th: props => <TableCell component="th" {...props} />,
        },
      }),
    [body, classes.divider],
  );
  const hast = React.useMemo(
    () => processor.processSync(Description).result,
    [Description, processor],
  );

  const TaskIcon = icons[icon];

  const [open] = useState(Fixe);

  const handleClick = event => {
    onClick(event);
  };

  return (
    <Box className={clsx({ [classes.root]: !mounted })}>
      {showPin && (
        <Tooltip
          title={Titre}
          placement="right"
          enterDelay={100}
          disableHoverListener
        >
          <span>
            <Fab
              className={clsx({
                [classes.additional]: true,
                [classes.selectedAdditional]: isSelected && mounted,
              })}
              style={{
                display: `${Fixe || open ? 'none' : 'block'}`,
              }}
              onClick={handleClick}
              disabled={!mounted}
            >
              <TaskIcon className={classes.icon} />
              {Tache && tris && (
                <Box
                  className={classes.badges}
                >
                  {tris
                    .slice(0, 3)
                    .map((tri, index) => (
                      <Box
                        key={tri}
                        className={clsx([classes.tri], [classes.triBadge])}
                        sx={{
                          zIndex: 3 - index,
                          marginLeft: index > 0 ? '-10px' : 'unset',
                        }}
                      >
                        {tri}
                      </Box>
                    ))}
                  {trisLeft > 0 && (
                  <Typography className={classes.trisLeft}>
                    + {trisLeft}
                  </Typography>
                  )}
                </Box>
              )}
            </Fab>
          </span>
        </Tooltip>
      )}
      {((open && mounted) || !mounted) && (
        <Box
          className={clsx({
            [classes.additionalContent]: true,
            [classes.selectedAdditionalContent]: isSelected && mounted,
            [classes.mountedAdditionalContent]: mounted,
            [classes.fixed]: Fixe,
            [classes.mountedFixed]: Fixe && mounted,
            [classes.popup]: !Fixe,
          })}
          onClick={handleClick}
        >
          <Box className={classes.header}>
            <Typography variant={Fixe ? 'h6' : 'unset'} sx={{ fontWeight: 'bold' }} className={classes.text}>
              {Titre}
            </Typography>
            {!Fixe && (
              <Close
                className={clsx({
                  [classes.closeIcon]: true,
                  [classes.mountedCloseIcon]: mounted,
                })}
                onClick={handleClick}
              />
            )}
          </Box>
          <span className={classes.text}>
            {hast}
          </span>
          {Tache && (
            <Box className={classes.triList}>
              {tris.map(tri => (
                <Box
                  key={tri}
                  className={classes.tri}
                >
                  {tri}
                </Box>
              ))}
            </Box>
          )}
          {Tache && (
            <Button
              variant="contained"
              size="small"
              disableElevation
              className={classes.btn}
              disabled={!mounted}
            >
              Participer
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}

export default React.memo(AdditionalsPopup);
