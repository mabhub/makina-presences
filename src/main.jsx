import React from 'react';
import * as Sentry from '@sentry/react';
import { createRoot } from 'react-dom/client';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

Sentry.init({
  dsn: 'https://bf4e46b4158993bcf8c6908453850b89@sentry.makina-corpus.net/94',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Tracing
  // tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  // tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
  // Session Replay
  // This sets the sample rate at 10%.
  // You may want to change it to 100% while in development
  // and then sample at a lower rate in production.
  // replaysSessionSampleRate: 0.1,
  // If you're not already sampling the entire session,
  // change the sample rate to 100% when sampling sessions where errors occur.
  // replaysOnErrorSampleRate: 1.0,
});

/* eslint-disable import/first */
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
/* eslint-enable import/first */

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
