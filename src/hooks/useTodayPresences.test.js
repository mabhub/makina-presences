/**
 * Tests for useTodayPresences hook
 * This hook filters presences for a specific day from an array of presences
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import useTodayPresences from './useTodayPresences';

describe('useTodayPresences', () => {
  const mockPresences = [
    { id: 1, day: '2024-06-01', tri: 'ABC', spot: 'A1' },
    { id: 2, day: '2024-06-01', tri: 'DEF', spot: 'A2' },
    { id: 3, day: '2024-06-02', tri: 'ABC', spot: 'B1' },
    { id: 4, day: '2024-06-02', tri: 'GHI', spot: 'B2' },
    { id: 5, day: '2024-06-03', tri: 'ABC', spot: 'C1' },
  ];

  it('should filter presences for a specific day', () => {
    const { result } = renderHook(() =>
      useTodayPresences('2024-06-01', mockPresences),
    );

    expect(result.current).toEqual([
      { id: 1, day: '2024-06-01', tri: 'ABC', spot: 'A1' },
      { id: 2, day: '2024-06-01', tri: 'DEF', spot: 'A2' },
    ]);
  });

  it('should return empty array when no presences match the day', () => {
    const { result } = renderHook(() =>
      useTodayPresences('2024-06-10', mockPresences),
    );

    expect(result.current).toEqual([]);
  });

  it('should handle empty presences array', () => {
    const { result } = renderHook(() =>
      useTodayPresences('2024-06-01', []),
    );

    expect(result.current).toEqual([]);
  });

  it('should return single presence when only one matches', () => {
    const { result } = renderHook(() =>
      useTodayPresences('2024-06-03', mockPresences),
    );

    expect(result.current).toEqual([
      { id: 5, day: '2024-06-03', tri: 'ABC', spot: 'C1' },
    ]);
  });

  it('should handle different day with multiple presences', () => {
    const { result } = renderHook(() =>
      useTodayPresences('2024-06-02', mockPresences),
    );

    expect(result.current).toHaveLength(2);
    expect(result.current).toEqual([
      { id: 3, day: '2024-06-02', tri: 'ABC', spot: 'B1' },
      { id: 4, day: '2024-06-02', tri: 'GHI', spot: 'B2' },
    ]);
  });

  it('should memoize result and only recompute when inputs change', () => {
    const { result, rerender } = renderHook(
      ({ date, presences }) => useTodayPresences(date, presences),
      {
        initialProps: { date: '2024-06-01', presences: mockPresences },
      },
    );

    const firstResult = result.current;

    // Rerender with same props
    rerender({ date: '2024-06-01', presences: mockPresences });
    expect(result.current).toBe(firstResult); // Same reference (memoized)

    // Rerender with different date
    rerender({ date: '2024-06-02', presences: mockPresences });
    expect(result.current).not.toBe(firstResult); // Different reference
    expect(result.current).toHaveLength(2);
  });

  it('should handle presences with additional properties', () => {
    const presencesWithExtra = [
      { id: 1, day: '2024-06-01', tri: 'ABC', spot: 'A1', period: 'fullday', plan: 'Office' },
      { id: 2, day: '2024-06-01', tri: 'DEF', spot: 'A2', period: 'morning' },
      { id: 3, day: '2024-06-02', tri: 'ABC', spot: 'B1' },
    ];

    const { result } = renderHook(() =>
      useTodayPresences('2024-06-01', presencesWithExtra),
    );

    expect(result.current).toEqual([
      { id: 1, day: '2024-06-01', tri: 'ABC', spot: 'A1', period: 'fullday', plan: 'Office' },
      { id: 2, day: '2024-06-01', tri: 'DEF', spot: 'A2', period: 'morning' },
    ]);
  });

  it('should handle undefined or null day in presences', () => {
    const presencesWithNullDay = [
      { id: 1, day: '2024-06-01', tri: 'ABC' },
      { id: 2, day: null, tri: 'DEF' },
      { id: 3, day: undefined, tri: 'GHI' },
      { id: 4, day: '2024-06-01', tri: 'JKL' },
    ];

    const { result } = renderHook(() =>
      useTodayPresences('2024-06-01', presencesWithNullDay),
    );

    expect(result.current).toEqual([
      { id: 1, day: '2024-06-01', tri: 'ABC' },
      { id: 4, day: '2024-06-01', tri: 'JKL' },
    ]);
  });
});
