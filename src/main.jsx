import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider,
  StyledEngineProvider,
} from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

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
      secondary: {
        main: '#f50057',
      },
    },
  }),
);

const queryClient = new QueryClient();

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <StyledEngineProvider injectFirst>
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
      </StyledEngineProvider>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
