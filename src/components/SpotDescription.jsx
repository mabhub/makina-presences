import React from 'react';
import clsx from 'clsx';

import {
  Box,
  Divider,
  Link,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import Rehype2react from 'rehype-react';

import { unified } from 'unified';

const useStyles = makeStyles(theme => ({
  root: {},
  tech: {
    fontSize: '0.8rem',
    color: theme.palette.grey[400],
    fontStyle: 'italic',
    textAlign: 'right',
  },
  description: {
    marginTop: theme.spacing(2),
  },
}));

const SpotDescription = ({ md = '', body = 'body2', spot = {}, className }) => {
  const classes = useStyles();

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
    () => processor.processSync(md).result,
    [md, processor],
  );

  return (
    <Box className={clsx(classes.root, className)}>
      <Typography variant="body2" className={classes.tech}>
        {spot.Bloqué && (
          <>
            <strong>Inscription impossible</strong>
            <br />
          </>
        )}
        Ref: {spot.Identifiant},{' '}
        type: {spot.Type.value}
      </Typography>

      {Boolean(md) && (
        <Box className={classes.description}>
          {hast}
        </Box>
      )}
    </Box>
  );
};

export default React.memo(SpotDescription);
