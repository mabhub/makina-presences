/* eslint-disable react/no-array-index-key */

import React from 'react';
import { Box } from '@mui/material';
import { findDuplicates } from '../helpers';

const SIZE = 0.75;

const TTOLine = ({ dates = [] }) => {
  if (!dates) { return null; }

  const total = dates.reduce((acc, { days: d = 0 }) => (acc + d), 0);
  const dups = findDuplicates(dates.map(({ from }) => from));

  // Single reference for the whole render so all cells agree on past/future.
  const now = Date.now();

  let inc = 0;
  return (
    <>
      {dates.map((date, i) => {
        // Future occurrences (e.g. upcoming dates of a recurring TTO) are dimmed
        // so the timeline distinguishes already-elapsed days from planned ones.
        const isFuture = new Date(date.from).getTime() > now;

        return (
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
                        opacity: isFuture ? 0.4 : 1,
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
                      opacity: isFuture ? 0.4 : 1,
                      ...(dups.includes(date.from) ? { borderColor: 'blue' } : {}),
                    }}
                  />
                </React.Fragment>
              );
            })}
          </React.Fragment>
        );
      })}

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
