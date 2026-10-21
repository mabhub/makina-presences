import { describe, it, expect, vi } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as Sentry from '@sentry/node';
import { captureUserError, readRelease } from '../sentry.mjs';

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

describe(readRelease, () => {
  const dir = mkdtempSync(join(tmpdir(), 'release-'));

  it('should build the release from the version stamped at build time', () => {
    const file = join(dir, 'release.txt');
    writeFileSync(file, '4.7.0-5-gc9b75e3\n');

    expect(readRelease(pathToFileURL(file))).toBe('presences@4.7.0-5-gc9b75e3');
  });

  it('should fall back to unknown when no version was stamped', () => {
    expect(readRelease(pathToFileURL(join(dir, 'missing.txt')))).toBe('unknown');
  });
});
