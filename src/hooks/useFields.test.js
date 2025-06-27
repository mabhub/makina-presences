/**
 * Tests for useFields hook
 * This hook fetches the list of fields for a given Baserow table using TanStack Query
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AllTheProviders } from '../testUtils';
import useFields from './useFields';

// Mock environment variables
vi.mock('vite:env', () => ({
  VITE_BASEROW_TOKEN: 'test-token',
}));

// Mock import.meta.env
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_BASEROW_TOKEN: 'test-token',
  },
  configurable: true,
});

describe('useFields', () => {
  const mockTableId = '12345';
  const mockFields = [
    { id: 1, name: 'Name', type: 'text' },
    { id: 2, name: 'Email', type: 'email' },
    { id: 3, name: 'Created', type: 'created_on' },
  ];

  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return empty array initially', () => {
    global.fetch.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce(mockFields),
    });

    const { result } = renderHook(() => useFields(mockTableId), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toEqual([]);
  });

  it('should fetch and return fields successfully', async () => {
    global.fetch.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce(mockFields),
    });

    const { result } = renderHook(() => useFields(mockTableId), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(result.current).toEqual(mockFields);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `https://api.baserow.io/api/database/fields/table/${mockTableId}/`,
      { headers: { Authorization: 'Token test-token' } },
    );
  });

  it('should handle different table IDs correctly', async () => {
    const differentTableId = '67890';
    global.fetch.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce(mockFields),
    });

    const { result } = renderHook(() => useFields(differentTableId), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(result.current).toEqual(mockFields);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `https://api.baserow.io/api/database/fields/table/${differentTableId}/`,
      { headers: { Authorization: 'Token test-token' } },
    );
  });

  it('should handle numeric table ID', async () => {
    const numericTableId = 12345;
    global.fetch.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce(mockFields),
    });

    const { result } = renderHook(() => useFields(numericTableId), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(result.current).toEqual(mockFields);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `https://api.baserow.io/api/database/fields/table/${numericTableId}/`,
      { headers: { Authorization: 'Token test-token' } },
    );
  });

  it('should return empty array on fetch error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useFields(mockTableId), {
      wrapper: AllTheProviders,
    });

    // Initially empty
    expect(result.current).toEqual([]);

    // Should remain empty after error (with retry logic, it might take time)
    await waitFor(() => {
      expect(result.current).toEqual([]);
    }, { timeout: 3000 });
  });

  it('should handle empty response', async () => {
    global.fetch.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce([]),
    });

    const { result } = renderHook(() => useFields(mockTableId), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(result.current).toEqual([]);
    });
  });

  it('should handle malformed JSON response', async () => {
    global.fetch.mockResolvedValueOnce({
      json: vi.fn().mockRejectedValueOnce(new Error('Invalid JSON')),
    });

    const { result } = renderHook(() => useFields(mockTableId), {
      wrapper: AllTheProviders,
    });

    // Should remain empty array on JSON parse error
    await waitFor(() => {
      expect(result.current).toEqual([]);
    }, { timeout: 3000 });
  });

  it('should use correct query configuration', async () => {
    global.fetch.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce(mockFields),
    });

    const { result } = renderHook(() => useFields(mockTableId), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(result.current).toEqual(mockFields);
    });

    // Verify the hook is using the correct query key (tableId)
    // This is tested implicitly through the fetch call verification above
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
