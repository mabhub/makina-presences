import React from 'react';
import { createRoot } from 'react-dom/client';

import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import {
  StyledEngineProvider,
} from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

import { QueryClient, QueryClientProvider } from 'react-query';

import ArchivePage from './components/ArchivePage';
import PresencePage from './components/PresencePage';

import ExpiredPrefPage, { expiredPref } from './components/ExpiredPrefPage';
import TTCount from './components/TTCount';
import DarkThemeProvider from './DarkThemeProvider';

const queryClient = new QueryClient();

const arePrefsExpired = expiredPref.length;

// Modern React 18+ root API (required for React 19)
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <StyledEngineProvider injectFirst>
        <DarkThemeProvider>
          <CssBaseline />
          {arePrefsExpired
            ? <ExpiredPrefPage />
            : (
              <Router>
                <Switch>
                  <Route path="/tt"><TTCount /></Route>
                  <Route path="/archives"><ArchivePage /></Route>
                  <Route path={['/', '/:place', '/:place/:day']} exact><PresencePage /></Route>
                  <Route path="*">Error 404</Route>
                </Switch>
              </Router>
            )}
        </DarkThemeProvider>
      </StyledEngineProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
