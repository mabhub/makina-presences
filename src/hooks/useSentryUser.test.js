import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Sentry from '@sentry/react';
import useSentryUser from './useSentryUser';
import { useTriState } from './usePersistedStates';

vi.mock('@sentry/react', () => ({
  setUser: vi.fn(),
}));

describe(useSentryUser, () => {
  // setupTests stubs localStorage: drive the stored trigram through getItem.
  const storeTri = tri => vi.mocked(localStorage.getItem)
    .mockImplementation(key => (key === 'tri' ? JSON.stringify(tri) : null));

  beforeEach(() => {
    vi.mocked(localStorage.getItem).mockReset();
    vi.mocked(Sentry.setUser).mockClear();
  });

  it('should set the stored trigram as Sentry user', () => {
    storeTri('abc');

    renderHook(() => useSentryUser());

    expect(Sentry.setUser).toHaveBeenLastCalledWith({ username: 'abc' });
  });

  it('should clear the Sentry user when no trigram is stored', () => {
    renderHook(() => useSentryUser());

    expect(Sentry.setUser).toHaveBeenLastCalledWith(null);
  });

  it('should follow trigram changes', () => {
    storeTri('abc');
    const { result } = renderHook(() => {
      useSentryUser();
      return useTriState('');
    });

    act(() => result.current[1]('xyz'));

    expect(Sentry.setUser).toHaveBeenLastCalledWith({ username: 'xyz' });
  });
});
