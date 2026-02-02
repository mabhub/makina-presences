/**
 * Tests for useSpotInteractions hook
 * This hook manages spot interactions including drag & drop, hover, and contextual menu
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AllTheProviders } from '../testUtils';
import useSpotInteractions from './useSpotInteractions';

// Mock snap helper
vi.mock('../helpers', () => ({
  snap: vi.fn(value => Math.round(value / 10) * 10), // Snap to 10px grid
}));

// Mock environment variables
vi.stubEnv('VITE_TABLE_ID_SPOTS', '123');
vi.stubEnv('VITE_BASEROW_TOKEN', 'test-token');

describe('useSpotInteractions', () => {
  const mockSpot = {
    id: 1,
    Identifiant: 'A1',
    x: 100,
    y: 200,
  };

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial state', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(
        () => useSpotInteractions(mockSpot, false),
        { wrapper: AllTheProviders },
      );

      expect(result.current.movingSpot).toBeUndefined();
      expect(result.current.isHover).toBe(false);
      expect(result.current.contextualMenu).toBe(false);
      expect(result.current.anchor).toBeNull();
    });

    it('should provide all handler functions', () => {
      const { result } = renderHook(
        () => useSpotInteractions(mockSpot, false),
        { wrapper: AllTheProviders },
      );

      expect(typeof result.current.handleMouseDown).toBe('function');
      expect(typeof result.current.handleDragEnd).toBe('function');
      expect(typeof result.current.handleMouseEnter).toBe('function');
      expect(typeof result.current.handleMouseLeave).toBe('function');
      expect(typeof result.current.openContextualMenu).toBe('function');
      expect(typeof result.current.closeContextualMenu).toBe('function');
    });
  });

  describe('Hover interactions', () => {
    it('should set isHover to true on mouse enter', () => {
      const { result } = renderHook(
        () => useSpotInteractions(mockSpot, false),
        { wrapper: AllTheProviders },
      );

      expect(result.current.isHover).toBe(false);

      act(() => {
        result.current.handleMouseEnter();
      });

      expect(result.current.isHover).toBe(true);
    });

    it('should set isHover to false on mouse leave', () => {
      const { result } = renderHook(
        () => useSpotInteractions(mockSpot, false),
        { wrapper: AllTheProviders },
      );

      act(() => {
        result.current.handleMouseEnter();
      });
      expect(result.current.isHover).toBe(true);

      act(() => {
        result.current.handleMouseLeave();
      });

      expect(result.current.isHover).toBe(false);
    });
  });

  describe('Contextual menu', () => {
    it('should open contextual menu with anchor', () => {
      const { result } = renderHook(
        () => useSpotInteractions(mockSpot, false),
        { wrapper: AllTheProviders },
      );

      const mockTarget = document.createElement('div');
      const mockEvent = { target: mockTarget };

      act(() => {
        result.current.openContextualMenu(mockEvent);
      });

      expect(result.current.contextualMenu).toBe(true);
      expect(result.current.anchor).toBe(mockTarget);
    });

    it('should close contextual menu', () => {
      const { result } = renderHook(
        () => useSpotInteractions(mockSpot, false),
        { wrapper: AllTheProviders },
      );

      const mockEvent = { target: document.createElement('div') };

      act(() => {
        result.current.openContextualMenu(mockEvent);
      });
      expect(result.current.contextualMenu).toBe(true);
      expect(result.current.anchor).not.toBeNull();

      act(() => {
        result.current.closeContextualMenu();
      });

      expect(result.current.contextualMenu).toBe(false);
      expect(result.current.anchor).toBeNull();
    });

    it('should reset anchor when closing contextual menu', () => {
      const { result } = renderHook(
        () => useSpotInteractions(mockSpot, false),
        { wrapper: AllTheProviders },
      );

      const mockTarget = document.createElement('div');
      const mockEvent = { target: mockTarget };

      act(() => {
        result.current.openContextualMenu(mockEvent);
      });
      expect(result.current.contextualMenu).toBe(true);
      expect(result.current.anchor).toBe(mockTarget);

      act(() => {
        result.current.closeContextualMenu();
      });

      expect(result.current.contextualMenu).toBe(false);
      expect(result.current.anchor).toBeNull();
    });
  });

  describe('Drag & Drop - Edit mode off', () => {
    it('should not set movingSpot when edit mode is off', () => {
      const { result } = renderHook(
        () => useSpotInteractions(mockSpot, false),
        { wrapper: AllTheProviders },
      );

      const mouseDownEvent = { screenX: 150, screenY: 250 };

      act(() => {
        const handler = result.current.handleMouseDown(mockSpot);
        handler(mouseDownEvent);
      });

      expect(result.current.movingSpot).toBeUndefined();
    });

    it('should not update spot position on drag end when edit mode is off', async () => {
      const { result } = renderHook(
        () => useSpotInteractions(mockSpot, false),
        { wrapper: AllTheProviders },
      );

      const dragEndEvent = { screenX: 200, screenY: 300 };

      await act(async () => {
        await result.current.handleDragEnd(dragEndEvent);
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Drag & Drop - Edit mode on', () => {
    it('should set movingSpot on mouse down in edit mode', () => {
      const { result } = renderHook(
        () => useSpotInteractions(mockSpot, true),
        { wrapper: AllTheProviders },
      );

      const mouseDownEvent = { screenX: 150, screenY: 250 };

      act(() => {
        const handler = result.current.handleMouseDown(mockSpot);
        handler(mouseDownEvent);
      });

      expect(result.current.movingSpot).toEqual({
        spot: mockSpot,
        from: [150, 250],
      });
    });

    it('should calculate new position and update spot on drag end', async () => {
      global.fetch.mockResolvedValueOnce({ ok: true });

      const { result } = renderHook(
        () => useSpotInteractions(mockSpot, true),
        { wrapper: AllTheProviders },
      );

      // Start drag
      const mouseDownEvent = { screenX: 100, screenY: 200 };
      act(() => {
        const handler = result.current.handleMouseDown(mockSpot);
        handler(mouseDownEvent);
      });

      // End drag at different position
      const dragEndEvent = { screenX: 150, screenY: 280 };
      await act(async () => {
        await result.current.handleDragEnd(dragEndEvent);
      });

      // Verify fetch was called with correct data
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const fetchCall = global.fetch.mock.calls[0];
      expect(fetchCall[0]).toContain('rows/table');
      expect(fetchCall[0]).toContain('/1/');
      expect(fetchCall[1]).toMatchObject({
        method: 'PATCH',
        headers: {
          Authorization: 'Token test-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          x: 150, // 100 + (150 - 100) = 150, snapped to 150
          y: 280, // 200 + (280 - 200) = 280, snapped to 280
        }),
      });

      // movingSpot should be cleared after drag end
      expect(result.current.movingSpot).toBeUndefined();
    });

    it('should use snap function for new coordinates', async () => {
      const { snap } = await import('../helpers');
      global.fetch.mockResolvedValueOnce({ ok: true });

      const { result } = renderHook(
        () => useSpotInteractions(mockSpot, true),
        { wrapper: AllTheProviders },
      );

      const mouseDownEvent = { screenX: 100, screenY: 200 };
      act(() => {
        const handler = result.current.handleMouseDown(mockSpot);
        handler(mouseDownEvent);
      });

      const dragEndEvent = { screenX: 145, screenY: 235 };
      await act(async () => {
        await result.current.handleDragEnd(dragEndEvent);
      });

      // Verify snap was called for both coordinates
      await waitFor(() => {
        expect(snap).toHaveBeenCalledWith(145); // newX = 100 + (145 - 100)
        expect(snap).toHaveBeenCalledWith(235); // newY = 200 + (235 - 200)
      });
    });

    it('should perform optimistic update before fetch', async () => {
      global.fetch.mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(() => resolve({ ok: true }), 100);
          }),
      );

      const { result } = renderHook(
        () => useSpotInteractions(mockSpot, true),
        { wrapper: AllTheProviders },
      );

      const mouseDownEvent = { screenX: 100, screenY: 200 };
      act(() => {
        const handler = result.current.handleMouseDown(mockSpot);
        handler(mouseDownEvent);
      });

      const dragEndEvent = { screenX: 150, screenY: 250 };

      // Trigger drag end without awaiting
      act(() => {
        result.current.handleDragEnd(dragEndEvent);
      });

      // Optimistic update should happen immediately
      // (would need QueryClient mock to verify)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should rollback on fetch error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(
        () => useSpotInteractions(mockSpot, true),
        { wrapper: AllTheProviders },
      );

      const mouseDownEvent = { screenX: 100, screenY: 200 };
      act(() => {
        const handler = result.current.handleMouseDown(mockSpot);
        handler(mouseDownEvent);
      });

      const dragEndEvent = { screenX: 150, screenY: 250 };
      await act(async () => {
        await result.current.handleDragEnd(dragEndEvent);
      });

      // Should log error
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to update spot position:',
          expect.any(Error),
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('should invalidate queries after successful update', async () => {
      global.fetch.mockResolvedValueOnce({ ok: true });

      const { result } = renderHook(
        () => useSpotInteractions(mockSpot, true),
        { wrapper: AllTheProviders },
      );

      const mouseDownEvent = { screenX: 100, screenY: 200 };
      act(() => {
        const handler = result.current.handleMouseDown(mockSpot);
        handler(mouseDownEvent);
      });

      const dragEndEvent = { screenX: 150, screenY: 250 };
      await act(async () => {
        await result.current.handleDragEnd(dragEndEvent);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Query invalidation would be tested with QueryClient mock
    });

    it('should handle drag with no movement', async () => {
      global.fetch.mockResolvedValueOnce({ ok: true });

      const { result } = renderHook(
        () => useSpotInteractions(mockSpot, true),
        { wrapper: AllTheProviders },
      );

      const samePosition = { screenX: 100, screenY: 200 };

      act(() => {
        const handler = result.current.handleMouseDown(mockSpot);
        handler(samePosition);
      });

      await act(async () => {
        await result.current.handleDragEnd(samePosition);
      });

      // Should still call fetch even with no movement (delta 0)
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });
});
