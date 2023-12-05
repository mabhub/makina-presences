/* eslint-disable react/no-array-index-key */

import React from 'react';
import { Box } from '@mui/material';

const SIZE = 1.2;

const TTRLine = ({ days = [] }) => days && (
  <>
    {'LMMJV'.split('').map((d, day) => (
      <Box
        key={day}
        title={day}
        sx={{
          width: `${SIZE}em`,
          height: `${SIZE}em`,
          display: 'inline-block',
          borderRadius: `calc(${SIZE}em / 2)`,
          background: days.includes(day) ? '#55aa55' : '#11aa1122',
          mr: '1px',
          verticalAlign: 'middle',
        }}
      >
        <Box
          sx={{
            pt: '0.3em',
            fontSize: 9,
            textAlign: 'center',
            opacity: days.includes(day) ? 1 : 0.5,
            fontWeight: 'bold',
            color: days.includes(day) ? 'white' : 'inherit',
          }}
        >
          {d}
        </Box>
      </Box>
    ))}
  </>
);

export default TTRLine;
