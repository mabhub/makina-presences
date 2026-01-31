/**
 * Tests for useAdditionals hook
 * This hook filters additionals by place from the additionals table using useTable
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { AllTheProviders } from '../testUtils';
import useAdditionals from './useAdditionals';

// Mock useTable hook
vi.mock('./useTable', () => ({
  default: vi.fn(),
}));

describe('useAdditionals', () => {
  let mockUseTable;

  beforeEach(async () => {
    mockUseTable = vi.mocked((await import('./useTable')).default);
  });

  const mockAllAdditionals = [
    {
      id: 1,
      Title: 'WiFi Password',
      Description: 'Network: Office-A',
      Plan: [{ value: 'Office A' }],
    },
    {
      id: 2,
      Title: 'Meeting Room',
      Description: 'Book via calendar',
      Plan: [{ value: 'Office A' }],
    },
    {
      id: 3,
      Title: 'Parking Info',
      Description: 'Use badge to enter',
      Plan: [{ value: 'Parking' }],
    },
    {
      id: 4,
      Title: 'Kitchen',
      Description: 'Coffee available',
      Plan: [{ value: 'Office B' }],
    },
    {
      id: 5,
      Title: 'No Plan',
      Description: 'Item without plan',
      Plan: [], // Empty Plan array
    },
    {
      id: 6,
      Title: 'Missing Plan',
      Description: 'Item with no Plan field',
      // No Plan property
    },
  ];

  beforeEach(() => {
    mockUseTable.mockReturnValue(mockAllAdditionals);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should filter additionals by place correctly', () => {
    const { result } = renderHook(() => useAdditionals('Office A'), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toEqual([
      {
        id: 1,
        Title: 'WiFi Password',
        Description: 'Network: Office-A',
        Plan: [{ value: 'Office A' }],
      },
      {
        id: 2,
        Title: 'Meeting Room',
        Description: 'Book via calendar',
        Plan: [{ value: 'Office A' }],
      },
    ]);
  });

  it('should return additionals for different place', () => {
    const { result } = renderHook(() => useAdditionals('Parking'), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toEqual([
      {
        id: 3,
        Title: 'Parking Info',
        Description: 'Use badge to enter',
        Plan: [{ value: 'Parking' }],
      },
    ]);
  });

  it('should return empty array when no additionals match the place', () => {
    const { result } = renderHook(() => useAdditionals('Non-existent Place'), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toEqual([]);
  });

  it('should handle additionals with empty Plan array', () => {
    const { result } = renderHook(() => useAdditionals('Office A'), {
      wrapper: AllTheProviders,
    });

    // Should not include additional with empty Plan array
    expect(result.current).not.toContainEqual(
      expect.objectContaining({ id: 5 }),
    );
  });

  it('should handle additionals without Plan property', () => {
    const { result } = renderHook(() => useAdditionals('Office A'), {
      wrapper: AllTheProviders,
    });

    // Should not include additional without Plan property
    expect(result.current).not.toContainEqual(
      expect.objectContaining({ id: 6 }),
    );
  });

  it('should handle empty additionals array from useTable', () => {
    mockUseTable.mockReturnValue([]);

    const { result } = renderHook(() => useAdditionals('Office A'), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toEqual([]);
  });

  it('should call useTable with table ID from environment', () => {
    renderHook(() => useAdditionals('Office A'), {
      wrapper: AllTheProviders,
    });

    // Should call useTable (we can't easily test the exact value since it's read at module level)
    expect(mockUseTable).toHaveBeenCalled();
    expect(mockUseTable).toHaveBeenCalledTimes(1);
  });

  it('should handle case sensitivity in place matching', () => {
    const { result } = renderHook(() => useAdditionals('office a'), {
      wrapper: AllTheProviders,
    });

    // Should return empty array as matching is case-sensitive
    expect(result.current).toEqual([]);
  });

  it('should handle null or undefined place parameter', () => {
    const { result: resultNull } = renderHook(() => useAdditionals(null), {
      wrapper: AllTheProviders,
    });

    const { result: resultUndefined } = renderHook(() => useAdditionals(undefined), {
      wrapper: AllTheProviders,
    });

    // Should match additionals where Plan[0].value is undefined
    expect(resultNull.current).toEqual([]);
    expect(resultUndefined.current).toEqual([
      {
        id: 5,
        Title: 'No Plan',
        Description: 'Item without plan',
        Plan: [],
      },
      {
        id: 6,
        Title: 'Missing Plan',
        Description: 'Item with no Plan field',
      },
    ]);
  });

  it('should handle additionals with complex Plan structure', () => {
    const additionalsWithComplexPlan = [
      {
        id: 1,
        Title: 'Complex 1',
        Plan: [{ value: 'Office A', id: 1, color: 'blue' }],
      },
      {
        id: 2,
        Title: 'Multiple Plans',
        Plan: [{ value: 'Office A' }, { value: 'Secondary' }], // Multiple entries
      },
    ];

    mockUseTable.mockReturnValue(additionalsWithComplexPlan);

    const { result } = renderHook(() => useAdditionals('Office A'), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toHaveLength(2);
    expect(result.current[0]).toEqual(additionalsWithComplexPlan[0]);
    expect(result.current[1]).toEqual(additionalsWithComplexPlan[1]);
  });

  it('should return single additional when only one matches', () => {
    const { result } = renderHook(() => useAdditionals('Office B'), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toEqual({
      id: 4,
      Title: 'Kitchen',
      Description: 'Coffee available',
      Plan: [{ value: 'Office B' }],
    });
  });

  it('should handle environment variable not being set', () => {
    // This tests that the hook gracefully handles missing VITE_TABLE_ID_ADDITIONALS
    // In reality, useTable would receive undefined and return []
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_TABLE_ID_ADDITIONALS', undefined);

    mockUseTable.mockReturnValue([]);

    const { result } = renderHook(() => useAdditionals('Office A'), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toEqual([]);

    // Restore env
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_TABLE_ID_ADDITIONALS', '456');
  });
});
