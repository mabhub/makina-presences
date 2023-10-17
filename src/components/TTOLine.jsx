/* eslint-disable react/no-array-index-key */

import React from 'react';
import { Box } from '@mui/material';

const SIZE = 0.75;

const TTOLine = ({ dates = [] }) => {
  const total = dates.reduce((acc, { days: d = 0 }) => (acc + d), 0);

  return (
    <>
      {dates.map(date => (
        <React.Fragment key={date.from}>
          {[...Array(date.days)].map((_, index) => (
            <React.Fragment
              key={date.from + index}
            >
              {Boolean(index) && (
                <Box
                  sx={{
                    display: 'inline-block',
                    width: '1px',
                    height: `${SIZE}em`,
                    background: 'orange',
                    verticalAlign: 'middle',
                  }}
                />
              )}
              <Box
                title={date.from}
                sx={{
                  width: `${SIZE}em`,
                  height: `${SIZE}em`,
                  display: 'inline-block',
                  border: '1px solid #55aa55',
                  background: '#55aa55',
                  ml: !index ? '1px' : 0,
                  verticalAlign: 'middle',
                }}
              />
            </React.Fragment>
          ))}
        </React.Fragment>
      ))}

      {[...Array(Math.max(30 - total, 0))].map((_, index) => (
        <Box
          key={index}
          sx={{
            width: `${SIZE}em`,
            height: `${SIZE}em`,
            display: 'inline-block',
            border: '1px solid #ddddee',
            ml: '1px',
            verticalAlign: 'middle',
          }}
        />
      ))}
    </>
  );
};

export default TTOLine;
