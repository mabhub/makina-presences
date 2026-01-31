/**
 * Tests for usePlan hook
 * This hook finds a plan by any of its fields using usePlans
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { AllTheProviders } from '../testUtils';
import usePlan from './usePlan';

// Mock usePlans hook
vi.mock('./usePlans', () => ({
  default: vi.fn(),
}));

describe('usePlan', () => {
  let mockUsePlans;

  beforeEach(async () => {
    mockUsePlans = vi.mocked((await import('./usePlans')).default);
  });

  const mockPlans = [
    {
      id: 1,
      Name: 'Toulouse',
      Label: 'Bureau Toulouse',
      uuid: 'uuid-toulouse-123',
      capacity: 50,
    },
    {
      id: 2,
      Name: 'Paris',
      Label: 'Bureau Paris',
      uuid: 'uuid-paris-456',
      capacity: 100,
    },
    {
      id: 3,
      Name: 'Lyon',
      Label: 'Bureau Lyon',
      uuid: 'uuid-lyon-789',
      capacity: 75,
    },
  ];

  beforeEach(() => {
    mockUsePlans.mockReturnValue(mockPlans);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should find plan by Name field', () => {
    const { result } = renderHook(() => usePlan({ Name: 'Toulouse' }), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toEqual({
      id: 1,
      Name: 'Toulouse',
      Label: 'Bureau Toulouse',
      uuid: 'uuid-toulouse-123',
      capacity: 50,
    });
  });

  it('should find plan by uuid field', () => {
    const { result } = renderHook(() => usePlan({ uuid: 'uuid-paris-456' }), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toEqual({
      id: 2,
      Name: 'Paris',
      Label: 'Bureau Paris',
      uuid: 'uuid-paris-456',
      capacity: 100,
    });
  });

  it('should find plan by Label field', () => {
    const { result } = renderHook(() => usePlan({ Label: 'Bureau Lyon' }), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toEqual({
      id: 3,
      Name: 'Lyon',
      Label: 'Bureau Lyon',
      uuid: 'uuid-lyon-789',
      capacity: 75,
    });
  });

  it('should return undefined when no plan matches', () => {
    const { result } = renderHook(() => usePlan({ Name: 'NonExistent' }), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toBeUndefined();
  });

  it('should return undefined when selector is empty object', () => {
    const { result } = renderHook(() => usePlan({}), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toBeUndefined();
  });

  it('should return undefined when selector is undefined', () => {
    const { result } = renderHook(() => usePlan(), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toBeUndefined();
  });

  it('should return undefined when value is undefined', () => {
    const { result } = renderHook(() => usePlan({ Name: undefined }), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toBeUndefined();
  });

  it('should handle numeric field values', () => {
    const { result } = renderHook(() => usePlan({ id: 2 }), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toEqual({
      id: 2,
      Name: 'Paris',
      Label: 'Bureau Paris',
      uuid: 'uuid-paris-456',
      capacity: 100,
    });
  });

  it('should return first matching plan when multiple fields provided (only uses first)', () => {
    // usePlan only uses the first field/value pair from selector
    const { result } = renderHook(
      () => usePlan({ Name: 'Toulouse', uuid: 'wrong-uuid' }),
      { wrapper: AllTheProviders },
    );

    // Should match by Name (first field)
    expect(result.current).toEqual({
      id: 1,
      Name: 'Toulouse',
      Label: 'Bureau Toulouse',
      uuid: 'uuid-toulouse-123',
      capacity: 50,
    });
  });

  it('should handle empty plans array', () => {
    mockUsePlans.mockReturnValue([]);

    const { result } = renderHook(() => usePlan({ Name: 'Toulouse' }), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toBeUndefined();
  });

  it('should memoize result when inputs do not change', () => {
    const { result, rerender } = renderHook(
      ({ selector }) => usePlan(selector),
      {
        wrapper: AllTheProviders,
        initialProps: { selector: { Name: 'Toulouse' } },
      },
    );

    const firstResult = result.current;

    // Rerender with same selector
    rerender({ selector: { Name: 'Toulouse' } });
    expect(result.current).toBe(firstResult); // Same reference (memoized)
  });

  it('should recompute when selector changes', () => {
    const { result, rerender } = renderHook(
      ({ selector }) => usePlan(selector),
      {
        wrapper: AllTheProviders,
        initialProps: { selector: { Name: 'Toulouse' } },
      },
    );

    expect(result.current?.Name).toBe('Toulouse');

    // Change selector
    rerender({ selector: { Name: 'Paris' } });
    expect(result.current?.Name).toBe('Paris');
  });

  it('should recompute when plans array changes', () => {
    const { result, rerender } = renderHook(
      () => usePlan({ Name: 'Bordeaux' }),
      { wrapper: AllTheProviders },
    );

    expect(result.current).toBeUndefined();

    // Update mock to include new plan
    mockUsePlans.mockReturnValue([
      ...mockPlans,
      {
        id: 4,
        Name: 'Bordeaux',
        Label: 'Bureau Bordeaux',
        uuid: 'uuid-bordeaux-999',
        capacity: 60,
      },
    ]);

    rerender();

    expect(result.current).toEqual({
      id: 4,
      Name: 'Bordeaux',
      Label: 'Bureau Bordeaux',
      uuid: 'uuid-bordeaux-999',
      capacity: 60,
    });
  });

  it('should handle plans with null or undefined field values', () => {
    mockUsePlans.mockReturnValue([
      { id: 1, Name: 'Plan1', Label: null },
      { id: 2, Name: 'Plan2', Label: undefined },
      { id: 3, Name: 'Plan3', Label: 'Valid Label' },
    ]);

    const { result: resultNull } = renderHook(() => usePlan({ Label: null }), {
      wrapper: AllTheProviders,
    });

    const { result: resultUndefined } = renderHook(() => usePlan({ Label: undefined }), {
      wrapper: AllTheProviders,
    });

    // null value should match plan with Label: null
    expect(resultNull.current).toEqual({ id: 1, Name: 'Plan1', Label: null });
    // undefined value triggers the guard and returns undefined
    expect(resultUndefined.current).toBeUndefined();
  });
});
