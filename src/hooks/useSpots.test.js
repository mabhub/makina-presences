/**
 * Tests for useSpots hook
 * This hook filters spots by place from the spots table using useTable
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { AllTheProviders } from '../testUtils';
import useSpots from './useSpots';

// Mock useTable hook
vi.mock('./useTable', () => ({
  default: vi.fn(),
}));

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_TABLE_ID_SPOTS: '123',
  },
  configurable: true,
});

describe('useSpots', () => {
  let mockUseTable;

  beforeEach(async () => {
    mockUseTable = vi.mocked((await import('./useTable')).default);
  });

  const mockAllSpots = [
    {
      id: 1,
      Identifiant: 'desk1',
      Plan: [{ value: 'Office A' }],
      Description: 'Main desk 1',
    },
    {
      id: 2,
      Identifiant: 'desk2',
      Plan: [{ value: 'Office A' }],
      Description: 'Main desk 2',
    },
    {
      id: 3,
      Identifiant: 'parking1',
      Plan: [{ value: 'Parking' }],
      Description: 'Parking spot 1',
    },
    {
      id: 4,
      Identifiant: 'meeting1',
      Plan: [{ value: 'Office B' }],
      Description: 'Meeting room 1',
    },
    {
      id: 5,
      Identifiant: 'desk3',
      Plan: [], // Empty Plan array
      Description: 'Desk without plan',
    },
    {
      id: 6,
      Identifiant: 'desk4',
      // No Plan property
      Description: 'Desk without Plan field',
    },
  ];

  beforeEach(() => {
    mockUseTable.mockReturnValue(mockAllSpots);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should filter spots by place correctly', () => {
    const { result } = renderHook(() => useSpots('Office A'), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toEqual([
      {
        id: 1,
        Identifiant: 'desk1',
        Plan: [{ value: 'Office A' }],
        Description: 'Main desk 1',
      },
      {
        id: 2,
        Identifiant: 'desk2',
        Plan: [{ value: 'Office A' }],
        Description: 'Main desk 2',
      },
    ]);
  });

  it('should return spots for different place', () => {
    const { result } = renderHook(() => useSpots('Parking'), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toEqual([
      {
        id: 3,
        Identifiant: 'parking1',
        Plan: [{ value: 'Parking' }],
        Description: 'Parking spot 1',
      },
    ]);
  });

  it('should return empty array when no spots match the place', () => {
    const { result } = renderHook(() => useSpots('Non-existent Office'), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toEqual([]);
  });

  it('should handle spots with empty Plan array', () => {
    const { result } = renderHook(() => useSpots('Office A'), {
      wrapper: AllTheProviders,
    });

    // Should not include spot with empty Plan array
    expect(result.current).not.toContainEqual(
      expect.objectContaining({ id: 5 }),
    );
  });

  it('should handle spots without Plan property', () => {
    const { result } = renderHook(() => useSpots('Office A'), {
      wrapper: AllTheProviders,
    });

    // Should not include spot without Plan property
    expect(result.current).not.toContainEqual(
      expect.objectContaining({ id: 6 }),
    );
  });

  it('should handle empty spots array from useTable', () => {
    mockUseTable.mockReturnValue([]);

    const { result } = renderHook(() => useSpots('Office A'), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toEqual([]);
  });

  it('should call useTable with correct table ID', () => {
    renderHook(() => useSpots('Office A'), {
      wrapper: AllTheProviders,
    });

    expect(mockUseTable).toHaveBeenCalledWith(67890); // Number conversion of VITE_TABLE_ID_SPOTS
  });

  it('should handle case sensitivity in place matching', () => {
    const { result } = renderHook(() => useSpots('office a'), {
      wrapper: AllTheProviders,
    });

    // Should return empty array as matching is case-sensitive
    expect(result.current).toEqual([]);
  });

  it('should handle null or undefined place parameter', () => {
    const { result: resultNull } = renderHook(() => useSpots(null), {
      wrapper: AllTheProviders,
    });

    const { result: resultUndefined } = renderHook(() => useSpots(undefined), {
      wrapper: AllTheProviders,
    });

    // Both null and undefined should match spots where Plan[0].value is undefined
    // (empty Plan array or missing Plan property)
    const expectedSpots = [
      {
        id: 5,
        Identifiant: 'desk3',
        Plan: [], // Empty Plan array -> value is undefined
        Description: 'Desk without plan',
      },
      {
        id: 6,
        Identifiant: 'desk4',
        // No Plan property -> value is undefined
        Description: 'Desk without Plan field',
      },
    ];

    expect(resultNull.current).toEqual([]);
    expect(resultUndefined.current).toEqual(expectedSpots);
  });

  it('should handle spots with complex Plan structure', () => {
    const spotsWithComplexPlan = [
      {
        id: 1,
        Identifiant: 'complex1',
        Plan: [{ value: 'Office A', id: 1, color: 'blue' }],
        Description: 'Complex plan spot',
      },
      {
        id: 2,
        Identifiant: 'complex2',
        Plan: [{ value: 'Office A' }, { value: 'Secondary' }], // Multiple entries
        Description: 'Multiple plan entries',
      },
    ];

    mockUseTable.mockReturnValue(spotsWithComplexPlan);

    const { result } = renderHook(() => useSpots('Office A'), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toHaveLength(2);
    expect(result.current[0]).toEqual(spotsWithComplexPlan[0]);
    expect(result.current[1]).toEqual(spotsWithComplexPlan[1]);
  });
});
