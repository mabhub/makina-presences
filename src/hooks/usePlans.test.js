/**
 * Tests for usePlans hook
 * This hook fetches all plans from the plans table using useTable
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { AllTheProviders } from '../testUtils';
import usePlans from './usePlans';

// Mock useTable hook
vi.mock('./useTable', () => ({
  default: vi.fn(),
}));

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_TABLE_ID_PLANS: '456',
  },
  configurable: true,
});

describe('usePlans', () => {
  let mockUseTable;

  beforeEach(async () => {
    mockUseTable = vi.mocked((await import('./useTable')).default);
  });

  const mockPlans = [
    {
      id: 1,
      Nom: 'Office A',
      Description: 'Main office floor',
      Couleur: '#FF5733',
    },
    {
      id: 2,
      Nom: 'Office B',
      Description: 'Second office floor',
      Couleur: '#33FF57',
    },
    {
      id: 3,
      Nom: 'Parking',
      Description: 'Parking area',
      Couleur: '#3357FF',
    },
  ];

  beforeEach(() => {
    mockUseTable.mockReturnValue(mockPlans);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return plans from useTable', () => {
    const { result } = renderHook(() => usePlans(), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toEqual(mockPlans);
  });

  it('should call useTable with correct table ID', () => {
    renderHook(() => usePlans(), {
      wrapper: AllTheProviders,
    });

    expect(mockUseTable).toHaveBeenCalledWith('11111'); // VITE_TABLE_ID_PLANS value
  });

  it('should handle empty plans array', () => {
    mockUseTable.mockReturnValue([]);

    const { result } = renderHook(() => usePlans(), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toEqual([]);
  });

  it('should handle single plan', () => {
    const singlePlan = [
      {
        id: 1,
        Nom: 'Single Office',
        Description: 'Only office',
        Couleur: '#000000',
      },
    ];

    mockUseTable.mockReturnValue(singlePlan);

    const { result } = renderHook(() => usePlans(), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toEqual(singlePlan);
  });

  it('should handle plans with different structures', () => {
    const variedPlans = [
      {
        id: 1,
        Nom: 'Plan with all fields',
        Description: 'Complete plan',
        Couleur: '#FF0000',
        ExtraField: 'Extra data',
      },
      {
        id: 2,
        Nom: 'Plan with minimal fields',
        // Missing some fields
      },
      {
        id: 3,
        // Missing name field
        Description: 'Plan without name',
        Couleur: '#00FF00',
      },
    ];

    mockUseTable.mockReturnValue(variedPlans);

    const { result } = renderHook(() => usePlans(), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toEqual(variedPlans);
  });

  it('should handle undefined response from useTable', () => {
    mockUseTable.mockReturnValue(undefined);

    const { result } = renderHook(() => usePlans(), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toBeUndefined();
  });

  it('should handle null response from useTable', () => {
    mockUseTable.mockReturnValue(null);

    const { result } = renderHook(() => usePlans(), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toBeNull();
  });

  it('should re-render when useTable data changes', () => {
    const { result, rerender } = renderHook(() => usePlans(), {
      wrapper: AllTheProviders,
    });

    // Initial render
    expect(result.current).toEqual(mockPlans);

    // Change the mock data
    const newPlans = [
      {
        id: 99,
        Nom: 'New Plan',
        Description: 'Updated plan',
        Couleur: '#FFFFFF',
      },
    ];
    mockUseTable.mockReturnValue(newPlans);

    // Re-render
    rerender();

    expect(result.current).toEqual(newPlans);
  });

  it('should call useTable only once per render', () => {
    renderHook(() => usePlans(), {
      wrapper: AllTheProviders,
    });

    expect(mockUseTable).toHaveBeenCalledTimes(1);
  });

  it('should maintain referential stability when data unchanged', () => {
    const { result, rerender } = renderHook(() => usePlans(), {
      wrapper: AllTheProviders,
    });

    const firstResult = result.current;

    // Re-render without changing data
    rerender();

    const secondResult = result.current;

    // Should be exactly the same reference since mockUseTable returns the same array
    expect(firstResult).toBe(secondResult);
  });
});
