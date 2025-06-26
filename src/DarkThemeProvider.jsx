import React, { useEffect, useState } from 'react';

import { useMediaQuery } from '@mui/material';
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StylesThemeProvider } from '@mui/styles';
import { grey } from '@mui/material/colors';

import createPersistedState from 'use-persisted-state';

const useThemePrefs = createPersistedState('themePref');

const validateTheme = themePrefs => (['light', 'dark'].includes(themePrefs) ? themePrefs : 'light');

const DarkThemeProvider = ({ children }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [themePrefs] = useThemePrefs('system');
  const [mode, setMode] = useState('light'); // Default to light mode

  useEffect(() => {
    if (themePrefs === 'system') {
      setMode(prefersDarkMode ? 'dark' : 'light');
      return;
    }
    setMode(validateTheme(themePrefs));
  }, [themePrefs, prefersDarkMode]);

  const theme = React.useMemo(
    () => {
      if (!mode) return null; // Prevent theme creation if mode is undefined

      return responsiveFontSizes(
        createTheme({
          palette: {
            mode,
            primary: {
              main: '#adb31b',
              contrastText: '#fff',
              fg: mode === 'dark' ? '#ffffff' : grey[600],
              bg: mode === 'dark' ? '#000000' : '#ffffff',
              elevated: mode === 'dark' ? '#1f1e1e' : '#fcfafa',
            },
            secondary: {
              main: '#211BB3',
              bg: mode === 'dark' ? '#333333' : '#f5f5f5',
            },
          },
        }),
      );
    },
    [mode],
  );

  // Don't render children until theme is ready
  if (!theme) return null;

  return (
    <ThemeProvider theme={theme}>
      <StylesThemeProvider theme={theme}>
        {children}
      </StylesThemeProvider>
    </ThemeProvider>
  );
};

export default DarkThemeProvider;
