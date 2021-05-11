import React from 'react';
import ReactDOM from 'react-dom';

import { createMuiTheme, responsiveFontSizes, ThemeProvider } from '@material-ui/core/styles';
import { CssBaseline } from '@material-ui/core';

import { QueryClient, QueryClientProvider } from 'react-query';

import App from './App';

const theme = responsiveFontSizes(
  createMuiTheme({
    palette: {
      primary: {
        main: '#adb31b',
        contrastText: '#fff',
      },
    },
  }),
);

const queryClient = new QueryClient();

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
