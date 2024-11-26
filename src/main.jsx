import React from 'react';
import ReactDOM from 'react-dom';

import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import { CssBaseline } from '@mui/material';
import {
  StyledEngineProvider,
} from '@mui/material/styles';

import { QueryClient, QueryClientProvider } from 'react-query';

import { AuthProvider } from 'react-oidc-context';
import { Redirect } from 'react-router-dom/cjs/react-router-dom.min';
import ArchivePage from './components/ArchivePage';
import PresencePage from './components/PresencePage';

import { version } from '../package.json';
import TTCount from './components/TTCount';
import DarkThemeProvider from './DarkThemeProvider';
import ProtectedApp, { oidcConfig, onSigninCallback } from './ProtectedApp';

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
    <AuthProvider {...oidcConfig} onSigninCallback={onSigninCallback}>
      <ProtectedApp>
        <QueryClientProvider client={queryClient}>
          <StyledEngineProvider injectFirst>
            <DarkThemeProvider>
              <CssBaseline />
              <Router>
                <Switch>
                  <Route path={['/:place', '/:place/:day']} exact><PresencePage /></Route>
                  <Route
                    path="/"
                    render={() => {
                      if (localStorage.agency !== undefined && JSON.parse(localStorage.getItem('agency')) !== 'Aucune') {
                        return <Redirect to={`/${JSON.parse(localStorage.agency)}`} />;
                      }
                      return <PresencePage />;
                    }}
                  />
                  <Route path="/tt"><TTCount /></Route>
                  <Route path="/archives"><ArchivePage /></Route>
                  <Route path="*">Error 404</Route>
                </Switch>
              </Router>
            </DarkThemeProvider>
          </StyledEngineProvider>
        </QueryClientProvider>
      </ProtectedApp>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
