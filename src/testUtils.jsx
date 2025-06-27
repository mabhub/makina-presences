/**
 * Test utilities for React components testing
 * Provides common test helpers and wrappers
 */

import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ThemeProvider as StylesThemeProvider } from '@mui/styles';
import { CssBaseline } from '@mui/material';

/**
 * Creates a new QueryClient for testing with disabled retries and logging
 * @returns {QueryClient} Configured test QueryClient
 */
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: Infinity,
    },
    mutations: {
      retry: false,
    },
  },
  logger: {
    log: () => {},
    warn: () => {},
    error: () => {},
  },
});

/**
 * Test theme for Material-UI components
 */
const testTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      bg: '#ffffff',
      fg: '#000000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc004e',
      bg: '#f5f5f5',
      fg: '#ffffff',
      contrastText: '#ffffff',
    },
  },
  spacing: factor => `${0.25 * factor}rem`, // Add spacing function
});

/**
 * Wrapper component that provides all necessary context providers for testing
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {QueryClient} props.queryClient - Optional QueryClient instance
 * @param {string} props.initialRoute - Initial route for BrowserRouter
 * @returns {JSX.Element} Wrapped component
 */
export const AllTheProviders = ({
  children,
  queryClient = createTestQueryClient(),
  initialRoute = '/',
}) => {
  // Set initial route if provided
  if (initialRoute !== '/') {
    window.history.pushState({}, 'Test page', initialRoute);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider theme={testTheme}>
          <StylesThemeProvider theme={testTheme}>
            <CssBaseline />
            {children}
          </StylesThemeProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

/**
 * Custom render function that wraps components with all necessary providers
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @param {QueryClient} options.queryClient - Optional QueryClient instance
 * @param {string} options.initialRoute - Initial route for BrowserRouter
 * @param {Object} options.renderOptions - Additional options passed to RTL render
 * @returns {Object} RTL render result with queryClient attached
 */
export const renderWithProviders = (ui, options = {}) => {
  const {
    queryClient = createTestQueryClient(),
    initialRoute = '/',
    ...renderOptions
  } = options;

  const wrapper = ({ children }) => (
    <AllTheProviders queryClient={queryClient} initialRoute={initialRoute}>
      {children}
    </AllTheProviders>
  );

  return {
    ...render(ui, { wrapper, ...renderOptions }),
    queryClient,
  };
};

/**
 * Mock hook for createPersistedState - returns a regular state hook
 * @param {any} defaultValue - Default value
 * @returns {Function} Mock hook function
 */
export const createMockPersistedState = defaultValue => () => React.useState(defaultValue);

/**
 * Mock fetch response helper
 * @param {any} data - Response data
 * @param {boolean} ok - Whether response is ok
 * @param {number} status - HTTP status code
 * @returns {Promise} Mock fetch response
 */
export const mockFetchResponse = (data, ok = true, status = 200) =>
  Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
  });

/**
 * Wait for TanStack Query to settle (useful for async operations)
 * @param {QueryClient} queryClient - QueryClient instance
 * @returns {Promise} Promise that resolves when queries settle
 */
export const waitForQueriesToSettle = async queryClient => {
  const queries = queryClient.getQueryCache().getAll();
  await Promise.all(
    queries.map(query => {
      if (query.state.fetchStatus === 'fetching') {
        return query.promise;
      }
      return Promise.resolve();
    }),
  );
};
