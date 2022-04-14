import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import {
  StyledEngineProvider,
} from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

import { QueryClient, QueryClientProvider } from 'react-query';

import PresencePage from './components/PresencePage';
import ArchivePage from './components/ArchivePage';

import { version } from '../package.json';
import TTCount from './components/TTCount';
import DarkThemeProvider from './DarkThemeProvider';

const { VITE_PROJECT_VERSION = version } = import.meta.env;

if (typeof localStorage.VITE_PROJECT_VERSION === 'undefined' || localStorage.VITE_PROJECT_VERSION === null) {
  localStorage.setItem('VITE_PROJECT_VERSION', VITE_PROJECT_VERSION);
}

if (localStorage.VITE_PROJECT_VERSION !== VITE_PROJECT_VERSION) {
  localStorage.clear();
}

const queryClient = new QueryClient();

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <StyledEngineProvider injectFirst>
        <DarkThemeProvider>
          <CssBaseline />
          <Router>
            <Switch>
              <Route path="/tt"><TTCount /></Route>
              <Route path={['/', '/:place', '/:place/:day']} exact><PresencePage /></Route>
              <Route path="/archives"><ArchivePage /></Route>
              <Route path="*">Error 404</Route>
            </Switch>
          </Router>
        </DarkThemeProvider>
      </StyledEngineProvider>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
