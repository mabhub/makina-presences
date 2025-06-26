import React from 'react';
import { createRoot } from 'react-dom/client';

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import {
  StyledEngineProvider,
} from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
                <Routes>
                  <Route path="/tt" element={<TTCount />} />
                  <Route path="/archives" element={<ArchivePage />} />
                  <Route path="/" element={<PresencePage />} />
                  <Route path="/:place" element={<PresencePage />} />
                  <Route path="/:place/:day" element={<PresencePage />} />
                  <Route path="*" element={<div>Error 404</div>} />
                </Routes>
              </Router>
            )}
        </DarkThemeProvider>
      </StyledEngineProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
