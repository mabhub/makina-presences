/**
 * Test setup configuration for Jest/Vitest
 * Sets up testing utilities and global configurations
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Mock environment variables that might be needed in tests
global.process = {
  ...global.process,
  env: {
    ...global.process?.env,
    VITE_BASEROW_TOKEN: 'test-token',
    VITE_TABLE_ID_PRESENCES: '12345',
    VITE_TABLE_ID_SPOTS: '67890',
    VITE_TABLE_ID_PLANS: '11111',
    VITE_PROJECT_VERSION: '2.3.0-test',
  },
};

// Mock localStorage for tests that use createPersistedState
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch API
global.fetch = vi.fn();

// Mock IntersectionObserver (often needed for Material-UI components)
global.IntersectionObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock ResizeObserver (often needed for Material-UI components)
global.ResizeObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}));

// Setup cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
