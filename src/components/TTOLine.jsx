/* eslint-disable react/no-array-index-key */

import React from 'react';
import { Box } from '@mui/material';

const SIZE = 0.75;

const TTOLine = ({ dates = [] }) => {
  const total = dates.reduce((acc, { days: d = 0 }) => (acc + d), 0);

  return (
    <>
      {dates.map(date => (
        <Box
          key={date.from}
          title={date.from}
          sx={{
            width: `calc(${date.days} * ${SIZE}em + ${date.days - 1}px)`,
            height: `${SIZE}em`,
            display: 'inline-block',
            border: '1px solid #55aa55',
            background: '#55aa55',
            mr: '1px',
            verticalAlign: 'middle',
          }}
        />
      ))}

      {[...Array(30 - total)].map((_, index) => (
        <Box
          key={index}
          sx={{
            width: `${SIZE}em`,
            height: `${SIZE}em`,
            display: 'inline-block',
            border: '1px solid #ddddee',
            mr: '1px',
            verticalAlign: 'middle',
          }}
        />
      ))}
    </>
  );
};

export default TTOLine;
