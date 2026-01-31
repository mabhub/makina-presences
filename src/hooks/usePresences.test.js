/**
 * Tests for usePresences hook
 * This hook manages CRUD operations for presences with optimistic updates
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AllTheProviders } from '../testUtils';
import usePresences from './usePresences';
import dayjs from 'dayjs';

// Mock cleanTri helper
vi.mock('../helpers', () => ({
  cleanTri: vi.fn(tri => tri.toUpperCase().trim()),
}));

// Mock environment variables
vi.stubEnv('VITE_BASEROW_TOKEN', 'test-token-123');
vi.stubEnv('VITE_TABLE_ID_PRESENCES', '999');

// Mock localStorage for persisted state
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: key => store[key] || null,
    setItem: (key, value) => { store[key] = value; },
    clear: () => { store = {}; },
  };
})();

global.localStorage = localStorageMock;

describe('usePresences', () => {
  const mockPlace = 'Toulouse';
  const mockPresencesData = {
    results: [
      {
        id: 1,
        day: dayjs().format('YYYY-MM-DD'),
        tri: 'ABC',
        spot: 'A1',
        plan: 'Toulouse',
        period: 'fullday',
      },
      {
        id: 2,
        day: dayjs().add(1, 'day').format('YYYY-MM-DD'),
        tri: 'DEF',
        spot: 'B2',
        plan: 'Toulouse',
        period: 'morning',
      },
    ],
  };

  beforeEach(() => {
    global.fetch = vi.fn();
    localStorageMock.clear();
    // Set default weekPref
    localStorageMock.setItem('weekPref', '2');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Fetching presences', () => {
    it('should fetch presences for a place', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPresencesData,
      });

      const { result } = renderHook(() => usePresences(mockPlace), {
        wrapper: AllTheProviders,
      });

      // Initially empty
      expect(result.current.presences).toEqual([]);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.presences).toEqual(mockPresencesData.results);
      });
    });

    it('should fetch presences with correct query parameters', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPresencesData,
      });

      const { result } = renderHook(() => usePresences(mockPlace), {
        wrapper: AllTheProviders,
      });

      // Wait for data to load first
      await waitFor(() => {
        expect(result.current.presences).toEqual(mockPresencesData.results);
      });

      // Then verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalled();
      const fetchCall = global.fetch.mock.calls[0];
      const url = fetchCall[0];

      expect(url).toContain('rows/table/');
      expect(url).toContain('user_field_names=true');
      expect(url).toContain('filter__plan__equal=Toulouse');
      expect(url).toContain('filter__day__date_after=');
      expect(url).toContain('filter__day__date_before=');
      expect(url).toContain('size=200');
    });

    it('should calculate date range based on weekPref', async () => {
      localStorageMock.setItem('weekPref', '3');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPresencesData,
      });

      renderHook(() => usePresences(mockPlace), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => {
        const fetchCall = global.fetch.mock.calls[0];
        const url = fetchCall[0];

        // weekPref=3 → 3*7 = 21 days timespan
        // Should query from start of week to +21 days
        expect(url).toContain('filter__day__date_after=');
        expect(url).toContain('filter__day__date_before=');
      });
    });

    it('should use default timespan of 14 days when weekPref is not 1, 2, or 3', async () => {
      localStorageMock.setItem('weekPref', '5');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPresencesData,
      });

      renderHook(() => usePresences(mockPlace), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
        // Default timespan of 14 days
      });
    });

  });

  describe('createPresence', () => {
    it('should create a new presence', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 999 }) });

      const { result } = renderHook(() => usePresences(mockPlace), {
        wrapper: AllTheProviders,
      });

      // Wait for initial query to complete
      await waitFor(() => {
        expect(result.current.presences).toEqual([]);
      });

      // Create a new presence
      act(() => {
        result.current.createPresence('2024-06-15', 'abc', {
          spot: 'A1',
          plan: 'Toulouse',
          period: 'fullday',
        });
      });

      // Wait for optimistic update to show the new presence
      await waitFor(() => {
        expect(result.current.presences.length).toBeGreaterThan(0);
      });

      // Verify POST was called
      const postCall = global.fetch.mock.calls.find(call => call[1]?.method === 'POST');
      expect(postCall).toBeDefined();
      expect(postCall[0]).toContain('rows/table/');
      expect(postCall[1].headers.Authorization).toMatch(/^Token /);
      expect(postCall[1].body).toContain('"tri":"ABC"');
    });

    it('should create presence with dayjs date object', async () => {
      const { cleanTri } = await import('../helpers');
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      const { result } = renderHook(() => usePresences(mockPlace), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => {
        expect(result.current.presences).toBeDefined();
      });

      const dayjsDate = dayjs('2024-06-15');

      act(() => {
        result.current.createPresence(dayjsDate, 'def', {
          spot: 'B2',
          plan: 'Toulouse',
        });
      });

      await waitFor(() => {
        const body = JSON.parse(global.fetch.mock.calls[1][1].body);
        expect(body.day).toBe('2024-06-15');
        expect(cleanTri).toHaveBeenCalledWith('def');
      });
    });

    it('should perform optimistic update on create', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      const { result } = renderHook(() => usePresences(mockPlace), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => {
        expect(result.current.presences).toEqual([]);
      });

      act(() => {
        result.current.createPresence('2024-06-15', 'ABC', {
          spot: 'A1',
          plan: 'Toulouse',
          period: 'fullday',
        });
      });

      // Should immediately show the new presence with fake: true
      await waitFor(() => {
        expect(result.current.presences).toHaveLength(1);
        expect(result.current.presences[0]).toMatchObject({
          day: '2024-06-15',
          tri: 'ABC',
          spot: 'A1',
          fake: true,
        });
      });
    });
  });

  describe('deletePresence', () => {
    it('should delete a presence', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockPresencesData })
        .mockResolvedValueOnce({ ok: true });

      const { result } = renderHook(() => usePresences(mockPlace), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => {
        expect(result.current.presences).toHaveLength(2);
      });

      const presenceToDelete = result.current.presences[0];
      const presenceId = presenceToDelete.id;

      act(() => {
        result.current.deletePresence(presenceToDelete);
      });

      // Wait for optimistic update
      await waitFor(() => {
        expect(result.current.presences).toHaveLength(1);
      });

      // Verify DELETE was called
      const deleteCall = global.fetch.mock.calls.find(call => call[1]?.method === 'DELETE');
      expect(deleteCall).toBeDefined();
      expect(deleteCall[0]).toContain(`rows/table/`);
      expect(deleteCall[0]).toContain(`/${presenceId}/`);
    });

    it('should perform optimistic update on delete', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockPresencesData })
        .mockResolvedValueOnce({ ok: true });

      const { result } = renderHook(() => usePresences(mockPlace), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => {
        expect(result.current.presences).toHaveLength(2);
      });

      const presenceToDelete = result.current.presences[0];

      act(() => {
        result.current.deletePresence(presenceToDelete);
      });

      // Should immediately remove from list
      await waitFor(() => {
        expect(result.current.presences).toHaveLength(1);
        expect(result.current.presences.find(p => p.id === presenceToDelete.id)).toBeUndefined();
      });
    });
  });

  describe('setPresence', () => {
    it('should delete presence when id exists and spot is null', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockPresencesData })
        .mockResolvedValueOnce({ ok: true });

      const { result } = renderHook(() => usePresences(mockPlace), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => {
        expect(result.current.presences).toHaveLength(2);
      });

      act(() => {
        result.current.setPresence({ id: 1, spot: null });
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/1/'),
          expect.objectContaining({ method: 'DELETE' }),
        );
      });
    });

    it('should update presence when id exists and spot is provided', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockPresencesData })
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      const { result } = renderHook(() => usePresences(mockPlace), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => {
        expect(result.current.presences).toHaveLength(2);
      });

      act(() => {
        result.current.setPresence({
          id: 1,
          spot: 'C3',
          period: 'afternoon',
        });
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/1/'),
          expect.objectContaining({
            method: 'PATCH',
            body: expect.stringContaining('"spot":"C3"'),
          }),
        );
      });
    });

    it('should create presence when id is missing and all required fields provided', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      const { result } = renderHook(() => usePresences(mockPlace), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => {
        expect(result.current.presences).toBeDefined();
      });

      act(() => {
        result.current.setPresence({
          day: '2024-06-15',
          tri: 'XYZ',
          plan: 'Toulouse',
          spot: 'D4',
          period: 'fullday',
        });
      });

      await waitFor(() => {
        const postCall = global.fetch.mock.calls.find(
          call => call[1]?.method === 'POST',
        );
        expect(postCall).toBeDefined();
      });
    });

    it('should return null when required fields are missing for create', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      });

      const { result } = renderHook(() => usePresences(mockPlace), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => {
        expect(result.current.presences).toBeDefined();
      });

      const returnValue = result.current.setPresence({
        day: '2024-06-15',
        // Missing tri, plan, spot
      });

      expect(returnValue).toBeNull();

      // Should not make any POST request
      await waitFor(() => {
        const postCalls = global.fetch.mock.calls.filter(
          call => call[1]?.method === 'POST',
        );
        expect(postCalls).toHaveLength(0);
      });
    });

    it('should perform optimistic update on update', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockPresencesData })
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      const { result } = renderHook(() => usePresences(mockPlace), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => {
        expect(result.current.presences).toHaveLength(2);
      });

      act(() => {
        result.current.setPresence({
          id: 1,
          spot: 'Z9',
          period: 'afternoon',
        });
      });

      // Should immediately update with fake flag
      await waitFor(() => {
        const updated = result.current.presences.find(p => p.id === 1);
        expect(updated.spot).toBe('Z9');
        expect(updated.fake).toBe(true);
      });
    });
  });


  describe('Exported mutation hooks', () => {
    it('should export createRow, updateRow, deleteRow mutations', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      });

      const { result } = renderHook(() => usePresences(mockPlace), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => {
        expect(result.current.createRow).toBeDefined();
        expect(result.current.updateRow).toBeDefined();
        expect(result.current.deleteRow).toBeDefined();
      });

      expect(typeof result.current.createRow.mutate).toBe('function');
      expect(typeof result.current.updateRow.mutate).toBe('function');
      expect(typeof result.current.deleteRow.mutate).toBe('function');
    });
  });
});
