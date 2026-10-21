import { describe, it, expect, vi } from 'vitest';
import * as Sentry from '@sentry/node';
import { captureUserError } from '../sentry.mjs';

vi.mock('@sentry/node', () => ({
  captureException: vi.fn(),
}));

describe(captureUserError, () => {
  it('should capture the error with the trigram as Sentry user', () => {
    const error = new Error('HTTP 404');

    captureUserError(error, 'abc');

    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      user: { username: 'abc' },
    });
  });
});
