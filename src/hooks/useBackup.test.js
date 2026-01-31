/**
 * Tests for useBackup hook (exported as useBackups)
 * This hook fetches the list of backup files from the archive root
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AllTheProviders } from '../testUtils';
import useBackups from './useBackup';

// Mock environment variables
vi.stubEnv('VITE_ARCHIVE_ROOT', 'https://archive.example.com');

describe('useBackups', () => {
  const mockBackupsList = [
    '2024-06-01.csv',
    '2024-06-01.tgz',
    '2024-06-02.csv',
    '2024-06-02.tgz',
    '2024-06-03.csv',
  ];

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch and return backups list', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBackupsList,
    });

    const { result } = renderHook(() => useBackups(), {
      wrapper: AllTheProviders,
    });

    // Initially returns empty array
    expect(result.current).toEqual([]);

    // Wait for data to be loaded
    await waitFor(() => {
      expect(result.current).toEqual(mockBackupsList);
    });
  });

  it('should call fetch with correct URL from environment variable', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBackupsList,
    });

    renderHook(() => useBackups(), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://archive.example.com/liste.json',
      );
    });
  });

  it('should return empty array when fetch fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useBackups(), {
      wrapper: AllTheProviders,
    });

    // Should return empty array on error
    expect(result.current).toEqual([]);

    // Wait for fetch to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Still returns empty array after error
    expect(result.current).toEqual([]);
  });


  it('should handle empty backups list', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const { result } = renderHook(() => useBackups(), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(result.current).toEqual([]);
    });
  });

  it('should handle backups with different file extensions', async () => {
    const diverseBackups = [
      '2024-06-01.csv',
      '2024-06-01.tgz',
      '2024-06-01.zip',
      '2024-06-01.json',
      'backup-20240601.tar.gz',
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => diverseBackups,
    });

    const { result } = renderHook(() => useBackups(), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(result.current).toEqual(diverseBackups);
    });
  });

  it('should handle malformed JSON response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    const { result } = renderHook(() => useBackups(), {
      wrapper: AllTheProviders,
    });

    // Should return empty array on JSON parse error
    expect(result.current).toEqual([]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });


  it('should handle missing VITE_ARCHIVE_ROOT environment variable', async () => {
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_ARCHIVE_ROOT', undefined);

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBackupsList,
    });

    renderHook(() => useBackups(), {
      wrapper: AllTheProviders,
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('undefined/liste.json');
    });

    // Restore
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_ARCHIVE_ROOT', 'https://archive.example.com');
  });

});
