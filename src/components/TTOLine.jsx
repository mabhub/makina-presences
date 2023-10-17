/* eslint-disable react/no-array-index-key */

import React from 'react';
import { Box } from '@mui/material';

const SIZE = 0.75;

const TTOLine = ({ dates = [] }) => {
  const total = dates.reduce((acc, { days: d = 0 }) => (acc + d), 0);

  let inc = 0;
  return (
    <>
      {dates.map((date, i) => (
        <React.Fragment key={date.from + i}>
          {[...Array(date.days)].map((_, index) => {
            inc += 1;

            return (
              <React.Fragment key={date.from + index}>
                {Boolean(index) && (
                  <Box
                    sx={{
                      display: 'inline-block',
                      width: '1px',
                      height: `${SIZE}em`,
                      background: inc <= 30 ? '#5a5a' : '#daaa',
                      verticalAlign: 'middle',
                      borderTop: `1px solid ${inc <= 30 ? '#5a5' : '#daa'}`,
                      borderBottom: `1px solid ${inc <= 30 ? '#5a5' : '#daa'}`,
                    }}
                  />
                )}
                <Box
                  title={date.from}
                  sx={{
                    width: `${SIZE}em`,
                    height: `${SIZE}em`,
                    display: 'inline-block',
                    border: `1px solid ${inc <= 30 ? '#5a5' : '#daa'}`,
                    background: inc <= 30 ? '#5a5' : '#daa',
                    ml: !index ? '1px' : 0,
                    verticalAlign: 'middle',
                  }}
                />
              </React.Fragment>
            );
          })}
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
