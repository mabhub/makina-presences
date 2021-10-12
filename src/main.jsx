import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { createTheme, responsiveFontSizes, ThemeProvider } from '@material-ui/core/styles';
import { CssBaseline } from '@material-ui/core';

import { QueryClient, QueryClientProvider } from 'react-query';

import PresencePage from './components/PresencePage';
import ArchivePage from './components/ArchivePage';

const theme = responsiveFontSizes(
  createTheme({
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
        <Router>
          <Switch>
            <Route exact path="/"><PresencePage /></Route>
            <Route path="/archives"><ArchivePage /></Route>
            <Route path="*">Error 404</Route>
          </Switch>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
