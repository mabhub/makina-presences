import { Box, Button, Divider, Link, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { Close } from '@mui/icons-material';

import Rehype2react from 'rehype-react';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { grey } from '@mui/material/colors';

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: '200px',
    maxWidth: '300px',
    minHeight: '50px',
    backgroundColor: theme.palette.primary.bg,
    padding: theme.spacing(1.5),
    borderRadius: '6px',
  },
  fixed: {
    border: theme.palette.mode === 'light' ? '1px solid #00000030' : '1px solid #ededed30',
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
    float: 'right',
  },

}));

function AdditionalsPopup ({ info }) {
  const classes = useStyles();

  const { Titre, Description, Tache, Fixe, tris } = info;

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

  return (
    <Box className={clsx({
      [classes.root]: true,
      [classes.fixed]: Fixe,
      [classes.popup]: !Fixe,
    })}
    >
      <Box className={classes.header}>
        <Typography variant={Fixe ? 'h6' : 'unset'} sx={{ fontWeight: 'bold' }} className={classes.text}>
          {Titre}
        </Typography>
        {!Fixe && (
        <Close
          className={classes.closeIcon}
        />
        )}
      </Box>
      <span className={classes.text}>
        {hast}
      </span>
      {Tache && (
      <Box className={classes.triList}>
        {(tris || ['amz']).map(tri => (
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
        >
          Participer
        </Button>
      )}
    </Box>
  );
}

export default React.memo(AdditionalsPopup);
