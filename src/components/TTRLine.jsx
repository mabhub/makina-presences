/* eslint-disable react/no-array-index-key */

import React from 'react';
import { Box } from '@mui/material';

const SIZE = 0.75;

const TTRLine = ({ days = [] }) => (
  <>
    {'LMMJV'.split('').map((d, day) => (
      <Box
        key={day}
        title={day}
        sx={{
          // width: `calc(${date.days} * ${SIZE}em + ${date.days - 1}px)`,
          width: `${SIZE}em`,
          height: `${SIZE}em`,
          display: 'inline-block',
          border: '1px solid #55aa55',
          background: days.includes(day) ? '#55aa55' : 'transparent',
          mr: '1px',
          verticalAlign: 'middle',
        }}
      >
        <Box
          sx={{
            fontSize: 7,
            textAlign: 'center',
          }}
        >
          {d}
        </Box>
      </Box>
    ))}
  </>
);

export default TTRLine;
