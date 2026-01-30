import { useMemo } from 'react';
import usePlans from './usePlans';

/**
 * Find a plan by any of its fields
 * @param {Object} selector - Search criteria with Baserow field name as key
 * @returns {Object|undefined} The plan object or undefined if not found
 *
 * @example
 * const plan = usePlan({ Name: 'Toulouse' });
 * const plan = usePlan({ uuid: 'abc-123' });
 * const plan = usePlan({ Label: 'Bureaux Paris' });
 */
const usePlan = (selector = {}) => {
  const plans = usePlans();

  // Extract first field/value pair for memoization dependencies
  const [[field, value] = []] = Object.entries(selector);

  return useMemo(() => {
    if (!field || value === undefined) return undefined;
    return plans.find(plan => plan[field] === value);
  }, [plans, field, value]);
};

export default usePlan;
