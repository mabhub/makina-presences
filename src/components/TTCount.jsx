import React from 'react';

import {
  Container,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

import Footer from './Footer';
import useTT from '../hooks/useTT';
import TTOLine from './TTOLine';
import TTRLine from './TTRLine';
import LoadIndicator from './LoadIndicator';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2),
  },
  th: {
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  current: {
    background: '#eee',
  },
}));

const TTCount = () => {
  const [sortField, setSortField] = React.useState('tri');
  const [sortInvert, setSortInvert] = React.useState(false);

  const handleSortChange = field => () => {
    if (field === sortField) {
      setSortInvert(prev => !prev);
    }

    setSortField(field);
  };

  const classes = useStyles();
  const { data = [] } = useTT();

  const users = React.useMemo(
    () => data
      .map(user => {
        user.tto?.sort(({ from: a }, { from: b }) => a.localeCompare(b));
        return user;
      })
      .sort(({ [sortField]: a }, { [sortField]: b }) => {
        const A = sortInvert ? a : b;
        const B = sortInvert ? b : a;

        if (['total'].includes(sortField)) {
          return Number(B) - Number(A);
        }

        return B.localeCompare(A);
      }),
    [data, sortField, sortInvert],
  );

  return (
    <div className="TTCount">
      <LoadIndicator />

      <Container className={classes.root}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell onClick={handleSortChange('tri')} className={classes.th}>
                  <TableSortLabel
                    direction={sortInvert ? 'asc' : 'desc'}
                    active={sortField === 'tri'}
                  >
                    tri
                  </TableSortLabel>
                </TableCell>

                <TableCell onClick={handleSortChange('total')} className={classes.th} align="right">
                  <TableSortLabel
                    direction={sortInvert ? 'asc' : 'desc'}
                    active={sortField === 'total'}
                  >
                    TTO (posé)
                  </TableSortLabel>
                </TableCell>

                <TableCell onClick={handleSortChange('total')} className={classes.th}>
                  <TableSortLabel
                    direction={!sortInvert ? 'asc' : 'desc'}
                  >
                    TTO (reste)
                  </TableSortLabel>
                </TableCell>

                <TableCell>
                  Timeline
                </TableCell>

                <TableCell>
                  TTR
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {users.map((row, index) => (
                <TableRow
                  key={row.tri}
                  sx={{
                    background: index % 2 ? 'transparent' : '#00000008',
                    opacity: Number(row.total) ? 1 : 0.5,
                  }}
                >
                  <TableCell>
                    {row.tri}
                  </TableCell>

                  <TableCell align="right">
                    {row.total}
                  </TableCell>

                  <TableCell>
                    {30 - row.total}
                  </TableCell>

                  <TableCell>
                    <TTOLine dates={row.tto} />
                  </TableCell>

                  <TableCell>
                    <TTRLine days={row.ttr} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
      <Footer />
    </div>
  );
};

export default TTCount;
