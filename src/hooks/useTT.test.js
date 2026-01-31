/**
 * Tests for useTT hook
 * This hook fetches time tracking (TT) data from Netlify functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AllTheProviders } from '../testUtils';
import useTT from './useTT';

describe('useTT', () => {
  const mockTTData = {
    users: [
      { tri: 'ABC', hours: 35, days: 5 },
      { tri: 'DEF', hours: 28, days: 4 },
      { tri: 'GHI', hours: 40, days: 5 },
    ],
    totalHours: 103,
    period: '2024-06',
  };

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch and return TT data', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTTData,
    });

    const { result } = renderHook(() => useTT(), {
      wrapper: AllTheProviders,
    });

    // Wait for data to be loaded
    await waitFor(() => {
      expect(result.current.data).toEqual(mockTTData);
    });
  });

  it('should call fetch with correct Netlify function URL', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTTData,
    });

    renderHook(() => useTT(), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/.netlify/functions/list');
    });
  });

  it('should return loading state initially', () => {
    global.fetch.mockImplementation(
      () =>
        new Promise(() => {}), // Never resolves
    );

    const { result } = renderHook(() => useTT(), {
      wrapper: AllTheProviders,
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });


  it('should handle empty TT data', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useTT(), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({});
    });
  });

  it('should handle TT data as array', async () => {
    const arrayTTData = [
      { tri: 'ABC', hours: 35 },
      { tri: 'DEF', hours: 28 },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => arrayTTData,
    });

    const { result } = renderHook(() => useTT(), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(arrayTTData);
    });
  });

  it('should return query object with standard react-query properties', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTTData,
    });

    const { result } = renderHook(() => useTT(), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify it has standard react-query properties
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('isError');
    expect(result.current).toHaveProperty('isSuccess');
    expect(result.current).toHaveProperty('refetch');
  });

});

