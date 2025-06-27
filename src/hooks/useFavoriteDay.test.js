/**
 * Tests for useFavoriteDay hook
 * This hook checks if a day is marked as favorite by the user
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import useFavoriteDay from './useFavoriteDay';

describe('useFavoriteDay', () => {
  const mockDayPrefs = ['L', 'M', 'V']; // Lundi, Mardi, Vendredi

  it('should return true when day is in preferences', () => {
    const { result } = renderHook(() => useFavoriteDay('L', mockDayPrefs));

    expect(result.current).toBe(true);
  });

  it('should return false when day is not in preferences', () => {
    const { result } = renderHook(() => useFavoriteDay('J', mockDayPrefs));

    expect(result.current).toBe(false);
  });

  it('should return false with empty preferences', () => {
    const { result } = renderHook(() => useFavoriteDay('L', []));

    expect(result.current).toBe(false);
  });

  it('should return false with undefined preferences', () => {
    const { result } = renderHook(() => useFavoriteDay('L', undefined));

    expect(result.current).toBe(false);
  });

  it('should handle null day label', () => {
    const { result } = renderHook(() => useFavoriteDay(null, mockDayPrefs));

    expect(result.current).toBe(false);
  });

  it('should handle undefined day label', () => {
    const { result } = renderHook(() => useFavoriteDay(undefined, mockDayPrefs));

    expect(result.current).toBe(false);
  });

  it('should be case sensitive for day comparison', () => {
    const { result } = renderHook(() => useFavoriteDay('l', mockDayPrefs)); // lowercase l vs uppercase L

    expect(result.current).toBe(false);
  });

  it('should work with single preference', () => {
    const { result } = renderHook(() => useFavoriteDay('M', ['M']));

    expect(result.current).toBe(true);
  });

  it('should recompute when dependencies change', () => {
    const { result, rerender } = renderHook(
      ({ dayLabel, dayPrefs }) => useFavoriteDay(dayLabel, dayPrefs),
      {
        initialProps: { dayLabel: 'L', dayPrefs: ['M', 'V'] },
      },
    );

    // Initially false
    expect(result.current).toBe(false);

    // Rerender with day in preferences
    rerender({ dayLabel: 'M', dayPrefs: ['M', 'V'] });
    expect(result.current).toBe(true);

    // Rerender with updated preferences
    rerender({ dayLabel: 'L', dayPrefs: ['L', 'V'] });
    expect(result.current).toBe(true);
  });
});
