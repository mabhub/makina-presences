import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import createPersistedState from 'use-persisted-state';

import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider,
  StyledEngineProvider,
} from '@mui/material/styles';
import { CssBaseline, useMediaQuery } from '@mui/material';

import { QueryClient, QueryClientProvider } from 'react-query';

import PresencePage from './components/PresencePage';
import ArchivePage from './components/ArchivePage';

import { version } from '../package.json';
import TTCount from './components/TTCount';
import { grey } from '@mui/material/colors';

const { VITE_PROJECT_VERSION = version } = import.meta.env;


if (typeof localStorage.VITE_PROJECT_VERSION === 'undefined' || localStorage.VITE_PROJECT_VERSION === null) {
  localStorage.setItem('VITE_PROJECT_VERSION', VITE_PROJECT_VERSION);
}

if (localStorage.VITE_PROJECT_VERSION !== VITE_PROJECT_VERSION) {
  localStorage.clear();
}

const useThemePrefs = createPersistedState('themePref');

const queryClient = new QueryClient();

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [themePrefs, setThemePrefs] = useThemePrefs();
  const [currentTheme, setCurrentTheme] = useState();

  useEffect(() => {
    if (themePrefs === "dark") {
      setCurrentTheme('dark');
    } else if (themePrefs === 'light') {
      setCurrentTheme('light');
    } else {
      setCurrentTheme(prefersDarkMode ? 'dark' : 'light');
      setThemePrefs('system');
    }
  }, [themePrefs, prefersDarkMode])

  const theme = React.useMemo(
    () =>
      responsiveFontSizes(createTheme({
        palette: {
          mode: currentTheme,
          primary: {
            main: '#adb31b',
            contrastText: '#fff',
            fg: currentTheme === 'dark' ? '#ffffff' : grey[600],
            bg: currentTheme === 'dark' ? '#000000' : '#ffffff',
          },
          secondary: {
            main: '#f50057',
            bg: currentTheme === 'dark' ? '#333333' : '#f5f5f5',
          },
        },
      })),
    [currentTheme],
  );
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
              <Switch>
                <Route path="/tt"><TTCount /></Route>
                <Route path={['/', '/:place', '/:place/:day']} exact><PresencePage /></Route>
                <Route path="/archives"><ArchivePage /></Route>
                <Route path="*">Error 404</Route>
              </Switch>
            </Router>
          </ThemeProvider>
        </StyledEngineProvider>
      </QueryClientProvider>
    </React.StrictMode>
  )
}

ReactDOM.render(
  <App />,
  document.getElementById('root'),
);
