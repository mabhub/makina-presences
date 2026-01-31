/**
 * Tests for useHolidays hook
 * This hook fetches French public holidays from etalab API
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AllTheProviders } from '../testUtils';
import useHolidays from './useHolidays';

describe('useHolidays', () => {
  const mockHolidays = {
    '2024-01-01': 'Jour de l\'an',
    '2024-05-01': 'Fête du Travail',
    '2024-05-08': 'Victoire 1945',
    '2024-07-14': 'Fête nationale',
    '2024-12-25': 'Noël',
  };

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch and return holidays data', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockHolidays,
    });

    const { result } = renderHook(() => useHolidays(), {
      wrapper: AllTheProviders,
    });

    // Initially returns empty object
    expect(result.current).toEqual({});

    // Wait for data to be loaded
    await waitFor(() => {
      expect(result.current).toEqual(mockHolidays);
    });
  });

  it('should call fetch with correct URL', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockHolidays,
    });

    renderHook(() => useHolidays(), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://etalab.github.io/jours-feries-france-data/json/metropole.json',
      );
    });
  });

  it('should return empty object when fetch fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useHolidays(), {
      wrapper: AllTheProviders,
    });

    // Should return empty object on error
    expect(result.current).toEqual({});

    // Wait a bit to ensure error handling completes
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Still returns empty object after error
    expect(result.current).toEqual({});
  });


  it('should handle empty holidays object', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useHolidays(), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(result.current).toEqual({});
    });
  });

  it('should handle holidays with various date formats', async () => {
    const holidaysWithDates = {
      '2024-01-01': 'New Year',
      '2024-12-25': 'Christmas',
      '2024-06-15': 'Mid Year Holiday',
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => holidaysWithDates,
    });

    const { result } = renderHook(() => useHolidays(), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(result.current).toEqual(holidaysWithDates);
    });

    // Verify can access individual holidays
    expect(result.current['2024-01-01']).toBe('New Year');
    expect(result.current['2024-12-25']).toBe('Christmas');
  });

  it('should handle malformed JSON response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    const { result } = renderHook(() => useHolidays(), {
      wrapper: AllTheProviders,
    });

    // Should return empty object on JSON parse error
    expect(result.current).toEqual({});

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

});
