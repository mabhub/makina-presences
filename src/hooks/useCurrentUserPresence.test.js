/**
 * Tests for useCurrentUserPresence hook
 * This hook finds the current user's presence (not cumulative) for a given day
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import useCurrentUserPresence from './useCurrentUserPresence';

describe('useCurrentUserPresence', () => {
  const mockTodayPresences = [
    { tri: 'ABC', spot: 'desk1' },
    { tri: 'DEF', spot: 'desk2' },
    { tri: 'ABC', spot: 'parking1' }, // cumulative spot
  ];

  const mockCumulativeSpot = [
    { Identifiant: 'parking1' },
    { Identifiant: 'parking2' },
  ];

  it('should return user presence when tri matches (case insensitive)', () => {
    const { result } = renderHook(() =>
      useCurrentUserPresence(mockTodayPresences, 'abc', mockCumulativeSpot));

    expect(result.current).toEqual({ tri: 'ABC', spot: 'desk1' });
  });

  it('should exclude cumulative spots', () => {
    const { result } = renderHook(() =>
      useCurrentUserPresence(mockTodayPresences, 'ABC', mockCumulativeSpot));

    // Should return desk1, not parking1 (which is cumulative)
    expect(result.current).toEqual({ tri: 'ABC', spot: 'desk1' });
  });

  it('should return undefined when no matching presence found', () => {
    const { result } = renderHook(() =>
      useCurrentUserPresence(mockTodayPresences, 'XYZ', mockCumulativeSpot));

    expect(result.current).toBeUndefined();
  });

  it('should return undefined when all presences are in cumulative spots', () => {
    const presencesAllCumulative = [
      { tri: 'ABC', spot: 'parking1' },
      { tri: 'ABC', spot: 'parking2' },
    ];

    const { result } = renderHook(() =>
      useCurrentUserPresence(presencesAllCumulative, 'ABC', mockCumulativeSpot));

    expect(result.current).toBeUndefined();
  });

  it('should return undefined with empty presences', () => {
    const { result } = renderHook(() =>
      useCurrentUserPresence([], 'ABC', mockCumulativeSpot));

    expect(result.current).toBeUndefined();
  });

  it('should return undefined with empty cumulative spots', () => {
    const { result } = renderHook(() =>
      useCurrentUserPresence(mockTodayPresences, 'ABC', []));

    expect(result.current).toEqual({ tri: 'ABC', spot: 'desk1' });
  });

  it('should handle whitespace in tri parameter', () => {
    const { result } = renderHook(() =>
      useCurrentUserPresence(mockTodayPresences, '  ABC  ', mockCumulativeSpot));

    expect(result.current).toEqual({ tri: 'ABC', spot: 'desk1' });
  });
});
