import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { useTriState } from './usePersistedStates';

/**
 * Keep the Sentry user in sync with the local trigram, so every front event
 * is attributed to the user who triggered it.
 * @returns {void}
 */
const useSentryUser = () => {
  const [tri] = useTriState('');

  useEffect(() => {
    Sentry.setUser(tri ? { username: tri } : null);
  }, [tri]);
};

export default useSentryUser;
