import { Close, ErrorOutline, HelpOutline, TaskAlt } from '@mui/icons-material';
import {
  alpha,
  Box,
  Button,
  Divider,
  Fab,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useState } from 'react';
import createPersistedState from 'use-persisted-state';

import { grey } from '@mui/material/colors';
import clsx from 'clsx';
import Rehype2react from 'rehype-react';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

const useStyles = makeStyles(theme => ({
  additional: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    backgroundColor: theme.palette.primary.bg,
    boxShadow: 'none',
    width: 20,
    minWidth: 20,
    height: 20,
    minHeight: 20,
    zIndex: 1,
    '&:hover': {
      background: alpha(theme.palette.primary.fg, 0.2),
    },
  },
  task: {
  },
  icon: {
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
  },
  triBadge: {
    border: theme.palette.mode === 'light' ? '1px solid #00000030' : '1px solid #ededed30',
  },
  trisLeft: {
    width: 12,
    fontSize: '0.6rem',
    letterSpacing: '-1.5px',
    lineHeight: 'normal',
    color: theme.palette.mode === 'light' ? 'dark' : 'white',
  },

  additionalContentBase: {
    position: 'absolute',
    backgroundColor: theme.palette.primary.bg,
    padding: theme.spacing(1.5),
    borderRadius: '6px',
    maxWidth: '300px',
    zIndex: 2,
  },
  fixed: {
    right: 10,
    transform: 'unset',
    zIndex: 1,
    border: theme.palette.mode === 'light' ? '1px solid #00000030' : '1px solid #ededed30',
  },
  popup: {
    transform: 'translate(-50%, -50%)',
    boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
    opacity: ({ open }) => `${open ? '1' : '0'}`,
    transition: theme.transitions.create('opacity'),
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
    float: 'right',
  },
}));

const useTriState = createPersistedState('tri');

const SpotAdditionals = ({ additional }) => {
  const { Titre, Description, Fixe, Tache, x, y, Tris } = additional;

  const [open, setOpen] = useState(Fixe);
  const classes = useStyles({ open });

  const handleClick = () => {
    setOpen(!open);
  };

  const [loggedTri] = useTriState();
  const [tris, setTris] = useState((Tris || '')
    .split(',')
    .filter(tri => tri !== ''));
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
          /* eslint-disable react/no-unstable-nested-components */
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
          /* eslint-enable react/no-unstable-nested-components */
        },
      }),
    [body, classes.divider],
  );
  const hast = React.useMemo(
    () => processor.processSync(Description).result,
    [Description, processor],
  );

  const handleRegister = () => {
    setTris([
      ...tris,
      loggedTri,
    ]);
  };

  const handleUnsubscribe = () => {
    setTris([
      ...tris.filter(tri => tri !== loggedTri),
    ]);
  };

  const getBadgePosition = () => {
    if (tris.length > 3) return -18;
    if (tris.length > 2) return -12;
    if (tris.length > 1) return -10;
    return 0;
  };

  const getTaskIcon = () => {
    if (tris.length === 0) {
      return (
        <ErrorOutline
          className={classes.icon}
          sx={{
            color: alpha('#FF0000', 1),
          }}
        />
      );
    }
    return (
      <TaskAlt
        sx={{ color: theme => theme.palette.primary.fg }}
        className={classes.icon}
      />
    );
  };

  return (
    <>
      <Tooltip
        title={Titre}
        placement="bottom"
        enterDelay={100}
      >
        <Fab
          className={clsx({
            [classes.additional]: true,
            [classes.task]: Tache,
          })}
          style={{
            left: `${x}px`,
            top: `${y}px`,
            display: `${Fixe ? 'none' : 'block'}`,
          }}
          onClick={handleClick}
        >
          {Tache
            ? (
              <>
                {getTaskIcon()}
                <Box
                  className={classes.badges}
                  sx={{
                    left: getBadgePosition(),
                  }}
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
              </>
            )
            : (
              <HelpOutline
                sx={{ color: theme => theme.palette.primary.fg }}
                className={classes.icon}
              />
            )}
        </Fab>
      </Tooltip>
      {open && (
        <Box
          className={clsx({
            [classes.additionalContentBase]: true,
            [classes.popup]: !Fixe,
            [classes.fixed]: Fixe,
          })}
          style={{
            left: Fixe ? 'unset' : `${x}px`,
            top: Fixe ? 10 : `${y}px`,
          }}
        >
          <Box className={classes.header}>
            <Typography variant={Fixe ? 'h6' : 'unset'} sx={{ fontWeight: 'bold' }}>
              {Titre}
            </Typography>
            {!Fixe && (
            <Close
              className={classes.closeIcon}
              onClick={handleClick}
            />
            )}
          </Box>
          {hast}
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
          {Tache && !tris.includes(loggedTri) && (
            <Button
              variant="contained"
              size="small"
              disableElevation
              className={classes.btn}
              onClick={handleRegister}
            >
              Go
            </Button>
          )}
          {Tache && tris.includes(loggedTri) && (
            <Button
              color="error"
              size="small"
              disableElevation
              className={classes.btn}
              onClick={handleUnsubscribe}
            >
              Annuler
            </Button>
          )}
        </Box>
      )}
    </>
  );
};

export default React.memo(SpotAdditionals);
