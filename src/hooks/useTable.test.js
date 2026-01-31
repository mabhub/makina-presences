/**
 * Tests for useTable hook
 * This hook fetches all rows from a given Baserow table with polling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AllTheProviders } from '../testUtils';
import useTable from './useTable';

// Mock environment variables
vi.stubEnv('VITE_BASEROW_TOKEN', 'test-token-123');

describe('useTable', () => {
  const mockTableId = 12345;
  const mockTableData = {
    count: 3,
    next: null,
    previous: null,
    results: [
      { id: 1, Name: 'Item 1', value: 'A' },
      { id: 2, Name: 'Item 2', value: 'B' },
      { id: 3, Name: 'Item 3', value: 'C' },
    ],
  };

  beforeEach(() => {
    global.fetch = vi.fn();
    // Suppress console.info for cleaner test output
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch and return table results', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTableData,
    });

    const { result } = renderHook(() => useTable(mockTableId), {
      wrapper: AllTheProviders,
    });

    // Initially returns empty array
    expect(result.current).toEqual([]);

    // Wait for data to be loaded
    await waitFor(() => {
      expect(result.current).toEqual(mockTableData.results);
    });
  });


  it('should not execute query when tableId is not defined', () => {
    const { result } = renderHook(() => useTable(null), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(console.info).toHaveBeenCalledWith(
      'useTable: tableId is not defined, query will not be executed',
    );
  });


  it('should return empty array when fetch fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useTable(mockTableId), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toEqual([]);

    // Wait for fetch to fail
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Still returns empty array after error
    expect(result.current).toEqual([]);
  });

  it('should throw error when response is not ok', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const { result } = renderHook(() => useTable(mockTableId), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Should return empty array when error occurs
    expect(result.current).toEqual([]);
  });


  it('should handle empty results array', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    });

    const { result } = renderHook(() => useTable(mockTableId), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(result.current).toEqual([]);
    });
  });

  it('should handle response without results property', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ count: 0 }), // Missing results
    });

    const { result } = renderHook(() => useTable(mockTableId), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(result.current).toEqual([]);
  });


  it('should handle malformed JSON response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    const { result } = renderHook(() => useTable(mockTableId), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(result.current).toEqual([]);
  });

  it('should handle string tableId by converting to number in URL', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTableData,
    });

    renderHook(() => useTable('12345'), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/table/12345/'),
        expect.any(Object),
      );
    });
  });
});
