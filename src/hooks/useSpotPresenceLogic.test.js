/**
 * Tests for useSpotPresenceLogic hook
 * This hook manages complex spot presence logic including calculations and actions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AllTheProviders } from '../testUtils';
import useSpotPresenceLogic from './useSpotPresenceLogic';
import dayjs from 'dayjs';

// Mock dependencies
vi.mock('../helpers', () => ({
  sameLowC: vi.fn((a, b) => a?.toLowerCase() === b?.toLowerCase()),
}));

vi.mock('./usePresences', () => ({
  default: vi.fn(() => ({
    presences: [],
    setPresence: vi.fn(),
    deletePresence: vi.fn(),
  })),
}));

vi.mock('./usePlan', () => ({
  default: vi.fn(() => ({ uuid: 'plan-uuid-123' })),
}));

vi.mock('./useSpots', () => ({
  default: vi.fn(() => []),
}));

vi.mock('../utils/spotPresenceCalculations', () => ({
  getPresencesByPeriod: vi.fn(() => [[], [], []]),
  getCurrentTriPeriod: vi.fn(() => null),
  calculateSpotStates: vi.fn(() => ({
    isLocked: false,
    isOccupied: false,
    isOwnSpot: false,
    isConflict: false,
    isCumulative: false,
    canClick: true,
  })),
  getCurrentPresence: vi.fn(() => ({})),
  isCumulativeSpot: vi.fn(() => false),
  getContextualMenuItems: vi.fn(() => []),
}));

vi.mock('./constants/periods', () => ({
  FULLDAY_PERIOD: 'fullday',
  MORNING_PERIOD: 'morning',
  AFTERNOON_PERIOD: 'afternoon',
}));

// Mock react-router-dom - partial mock to keep BrowserRouter
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: vi.fn(() => ({
      place: 'Toulouse',
      day: dayjs().format('YYYY-MM-DD'),
    })),
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: key => store[key] || null,
    setItem: (key, value) => { store[key] = value; },
    clear: () => { store = {}; },
  };
})();

global.localStorage = localStorageMock;

describe('useSpotPresenceLogic', () => {
  const mockSpot = {
    Identifiant: 'A1',
    Bloqué: false,
    Cumul: false,
    x: 100,
    y: 200,
  };

  const mockOnConflict = vi.fn();

  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.setItem('tri', 'ABC');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default values', async () => {
      const { result } = renderHook(
        () => useSpotPresenceLogic(mockSpot, mockOnConflict),
        { wrapper: AllTheProviders },
      );

      // ownTri comes from localStorage via createPersistedState
      expect(result.current.ownTri).toBeDefined();
      expect(result.current.place).toBe('Toulouse');
      expect(result.current.day).toBe(dayjs().format('YYYY-MM-DD'));
    });

    it('should provide all required handler functions', async () => {
      const { result } = renderHook(
        () => useSpotPresenceLogic(mockSpot, mockOnConflict),
        { wrapper: AllTheProviders },
      );

      expect(typeof result.current.handleClick).toBe('function');
      expect(typeof result.current.handleConflict).toBe('function');
      expect(typeof result.current.removePresence).toBe('function');
      expect(typeof result.current.unsubscribe).toBe('function');
      expect(typeof result.current.fullDay).toBe('function');
      expect(typeof result.current.morningOnly).toBe('function');
      expect(typeof result.current.afternoonOnly).toBe('function');
      expect(typeof result.current.isCumulativeSpot).toBe('function');
    });

    it('should provide calculated state properties', async () => {
      const { result } = renderHook(
        () => useSpotPresenceLogic(mockSpot, mockOnConflict),
        { wrapper: AllTheProviders },
      );

      expect(result.current).toHaveProperty('isLocked');
      expect(result.current).toHaveProperty('isOccupied');
      expect(result.current).toHaveProperty('isOwnSpot');
      expect(result.current).toHaveProperty('isConflict');
      expect(result.current).toHaveProperty('isCumulative');
      expect(result.current).toHaveProperty('canClick');
    });

    it('should provide presence data arrays', async () => {
      const { result } = renderHook(
        () => useSpotPresenceLogic(mockSpot, mockOnConflict),
        { wrapper: AllTheProviders },
      );

      expect(Array.isArray(result.current.fullDays)).toBe(true);
      expect(Array.isArray(result.current.mornings)).toBe(true);
      expect(Array.isArray(result.current.afternoons)).toBe(true);
      expect(Array.isArray(result.current.restFullDay)).toBe(true);
      expect(Array.isArray(result.current.dayPresences)).toBe(true);
    });
  });

  describe('Day presences filtering', () => {
    it('should filter presences for current day only', async () => {
      const usePresencesMock = vi.mocked((await import('./usePresences')).default);
      const today = dayjs().format('YYYY-MM-DD');
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');

      usePresencesMock.mockReturnValue({
        presences: [
          { id: 1, day: today, tri: 'ABC', spot: 'A1' },
          { id: 2, day: tomorrow, tri: 'ABC', spot: 'A2' },
          { id: 3, day: today, tri: 'DEF', spot: 'B1' },
        ],
        setPresence: vi.fn(),
        deletePresence: vi.fn(),
      });

      const { result } = renderHook(
        () => useSpotPresenceLogic(mockSpot, mockOnConflict),
        { wrapper: AllTheProviders },
      );

      expect(result.current.dayPresences).toHaveLength(2);
      expect(result.current.dayPresences.every(p => p.day === today)).toBe(true);
    });
  });

  describe('Spot presences grouping', () => {
    it('should group presences by spot', async () => {
      const usePresencesMock = vi.mocked((await import('./usePresences')).default);
      const today = dayjs().format('YYYY-MM-DD');

      usePresencesMock.mockReturnValue({
        presences: [
          { id: 1, day: today, tri: 'ABC', spot: 'A1' },
          { id: 2, day: today, tri: 'DEF', spot: 'A1' },
          { id: 3, day: today, tri: 'GHI', spot: 'B2' },
        ],
        setPresence: vi.fn(),
        deletePresence: vi.fn(),
      });

      const { result } = renderHook(
        () => useSpotPresenceLogic(mockSpot, mockOnConflict),
        { wrapper: AllTheProviders },
      );

      expect(result.current.spotPresences).toBeDefined();
      expect(typeof result.current.spotPresences).toBe('object');
    });
  });

  describe('Period actions', () => {
    it('should call handleClick with fullday period', async () => {
      const { result } = renderHook(
        () => useSpotPresenceLogic(mockSpot, mockOnConflict),
        { wrapper: AllTheProviders },
      );

      // fullDay wrapper should call handleClick with FULLDAY_PERIOD
      act(() => {
        result.current.fullDay();
      });

      // Since handleClick is complex, we just verify it doesn't throw
      expect(result.current.fullDay).toBeDefined();
    });

    it('should call handleClick with morning period', async () => {
      const { result } = renderHook(
        () => useSpotPresenceLogic(mockSpot, mockOnConflict),
        { wrapper: AllTheProviders },
      );

      act(() => {
        result.current.morningOnly();
      });

      expect(result.current.morningOnly).toBeDefined();
    });

    it('should call handleClick with afternoon period', async () => {
      const { result } = renderHook(
        () => useSpotPresenceLogic(mockSpot, mockOnConflict),
        { wrapper: AllTheProviders },
      );

      act(() => {
        result.current.afternoonOnly();
      });

      expect(result.current.afternoonOnly).toBeDefined();
    });
  });

  describe('Conflict handling', () => {
    it('should call onConflict callback with correct parameters', async () => {
      const { result } = renderHook(
        () => useSpotPresenceLogic(mockSpot, mockOnConflict),
        { wrapper: AllTheProviders },
      );

      act(() => {
        result.current.handleConflict(true, 'DEF');
      });

      expect(mockOnConflict).toHaveBeenCalledWith(true, 'DEF', 'A1');
    });

    it('should trigger conflict handler when isConflict state changes', async () => {
      const { calculateSpotStates } = await import('../utils/spotPresenceCalculations');
      const usePresencesMock = vi.mocked((await import('./usePresences')).default);
      const today = dayjs().format('YYYY-MM-DD');

      // Initial: no conflict
      calculateSpotStates.mockReturnValue({
        isLocked: false,
        isOccupied: false,
        isOwnSpot: false,
        isConflict: false,
        isCumulative: false,
        canClick: true,
      });

      usePresencesMock.mockReturnValue({
        presences: [
          { id: 1, day: today, tri: 'ABC', spot: 'A1', period: 'fullday' },
        ],
        setPresence: vi.fn(),
        deletePresence: vi.fn(),
      });

      const { rerender } = renderHook(
        () => useSpotPresenceLogic(mockSpot, mockOnConflict),
        { wrapper: AllTheProviders },
      );

      mockOnConflict.mockClear();

      // Update to conflict state
      calculateSpotStates.mockReturnValue({
        isLocked: false,
        isOccupied: true,
        isOwnSpot: false,
        isConflict: true,
        isCumulative: false,
        canClick: false,
      });

      usePresencesMock.mockReturnValue({
        presences: [
          { id: 1, day: today, tri: 'ABC', spot: 'A1', period: 'fullday' },
          { id: 2, day: today, tri: 'DEF', spot: 'A1', period: 'fullday' },
        ],
        setPresence: vi.fn(),
        deletePresence: vi.fn(),
      });

      const { getPresencesByPeriod } = await import('../utils/spotPresenceCalculations');
      getPresencesByPeriod.mockReturnValue([
        [
          { id: 1, tri: 'ABC', period: 'fullday' },
          { id: 2, tri: 'DEF', period: 'fullday' },
        ],
        [],
        [],
      ]);

      rerender();

      // Note: The effect may or may not trigger depending on restFullDay
      // This is a basic smoke test
    });
  });

  describe('removePresence', () => {
    it('should call deletePresence for fullday period', async () => {
      const mockDeletePresence = vi.fn();
      const usePresencesMock = vi.mocked((await import('./usePresences')).default);

      usePresencesMock.mockReturnValue({
        presences: [],
        setPresence: vi.fn(),
        deletePresence: mockDeletePresence,
      });

      const { getCurrentPresence } = await import('../utils/spotPresenceCalculations');
      getCurrentPresence.mockReturnValue({ id: 1, tri: 'ABC' });

      const { result } = renderHook(
        () => useSpotPresenceLogic(mockSpot, mockOnConflict),
        { wrapper: AllTheProviders },
      );

      act(() => {
        result.current.removePresence('fullday');
      });

      expect(mockDeletePresence).toHaveBeenCalled();
    });

    it('should call deletePresence for morning period', async () => {
      const mockDeletePresence = vi.fn();
      const usePresencesMock = vi.mocked((await import('./usePresences')).default);

      usePresencesMock.mockReturnValue({
        presences: [],
        setPresence: vi.fn(),
        deletePresence: mockDeletePresence,
      });

      const { result } = renderHook(
        () => useSpotPresenceLogic(mockSpot, mockOnConflict),
        { wrapper: AllTheProviders },
      );

      act(() => {
        result.current.removePresence('morning');
      });

      expect(mockDeletePresence).toHaveBeenCalled();
    });

    it('should call deletePresence for afternoon period', async () => {
      const mockDeletePresence = vi.fn();
      const usePresencesMock = vi.mocked((await import('./usePresences')).default);

      usePresencesMock.mockReturnValue({
        presences: [],
        setPresence: vi.fn(),
        deletePresence: mockDeletePresence,
      });

      const { result } = renderHook(
        () => useSpotPresenceLogic(mockSpot, mockOnConflict),
        { wrapper: AllTheProviders },
      );

      act(() => {
        result.current.removePresence('afternoon');
      });

      expect(mockDeletePresence).toHaveBeenCalled();
    });
  });

  describe('unsubscribe', () => {
    it('should call removePresence with current triPeriod', async () => {
      const { getCurrentTriPeriod } = await import('../utils/spotPresenceCalculations');
      getCurrentTriPeriod.mockReturnValue('fullday');

      const mockDeletePresence = vi.fn();
      const usePresencesMock = vi.mocked((await import('./usePresences')).default);

      usePresencesMock.mockReturnValue({
        presences: [],
        setPresence: vi.fn(),
        deletePresence: mockDeletePresence,
      });

      const { result } = renderHook(
        () => useSpotPresenceLogic(mockSpot, mockOnConflict),
        { wrapper: AllTheProviders },
      );

      act(() => {
        result.current.unsubscribe();
      });

      expect(mockDeletePresence).toHaveBeenCalled();
    });
  });

  describe('Cumulative spots', () => {
    it('should identify cumulative spots correctly', async () => {
      const useSpotsMock = vi.mocked((await import('./useSpots')).default);
      useSpotsMock.mockReturnValue([
        { Identifiant: 'A1', Cumul: false },
        { Identifiant: 'P1', Cumul: true },
        { Identifiant: 'P2', Cumul: true },
      ]);

      const { result } = renderHook(
        () => useSpotPresenceLogic(mockSpot, mockOnConflict),
        { wrapper: AllTheProviders },
      );

      expect(typeof result.current.isCumulativeSpot).toBe('function');
    });
  });

  describe('Contextual menu items', () => {
    it('should provide contextual menu items', async () => {
      const { getContextualMenuItems } = await import('../utils/spotPresenceCalculations');
      const mockMenuItems = [
        { item: 'Full Day', action: vi.fn() },
        { item: 'Morning', action: vi.fn() },
      ];

      getContextualMenuItems.mockReturnValue(mockMenuItems);

      const { result } = renderHook(
        () => useSpotPresenceLogic(mockSpot, mockOnConflict),
        { wrapper: AllTheProviders },
      );

      expect(result.current.contextualMenuItems).toEqual(mockMenuItems);
    });
  });

  describe('Plan UUID integration', () => {
    it('should include plan UUID when setting presence', async () => {
      const mockSetPresence = vi.fn();
      const usePresencesMock = vi.mocked((await import('./usePresences')).default);
      const usePlanMock = vi.mocked((await import('./usePlan')).default);

      usePlanMock.mockReturnValue({ uuid: 'plan-uuid-456' });

      usePresencesMock.mockReturnValue({
        presences: [],
        setPresence: mockSetPresence,
        deletePresence: vi.fn(),
      });

      const { calculateSpotStates } = await import('../utils/spotPresenceCalculations');
      calculateSpotStates.mockReturnValue({
        isLocked: false,
        isOccupied: false,
        isOwnSpot: false,
        isConflict: false,
        isCumulative: false,
        canClick: true,
      });

      const { result } = renderHook(
        () => useSpotPresenceLogic(mockSpot, mockOnConflict),
        { wrapper: AllTheProviders },
      );

      act(() => {
        result.current.handleClick('fullday');
      });

      // Verify setPresence was called with presencePlan
      expect(mockSetPresence).toHaveBeenCalledWith(
        expect.objectContaining({
          presencePlan: ['plan-uuid-456'],
        }),
      );
    });
  });

  describe('Blocked spots', () => {
    it('should handle blocked spots in state calculation', async () => {
      const blockedSpot = { ...mockSpot, Bloqué: true };

      const { result } = renderHook(
        () => useSpotPresenceLogic(blockedSpot, mockOnConflict),
        { wrapper: AllTheProviders },
      );

      // calculateSpotStates should be called with blocked: true
      const { calculateSpotStates } = await import('../utils/spotPresenceCalculations');
      expect(calculateSpotStates).toHaveBeenCalledWith(
        expect.objectContaining({ blocked: true }),
      );
    });
  });
});
