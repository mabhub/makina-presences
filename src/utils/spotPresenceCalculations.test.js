import { describe, it, expect } from 'vitest';
import {
  getCurrentTriPeriod,
  getPresencesByPeriod,
  getCurrentPresence,
  isCumulativeSpot,
} from './spotPresenceCalculations';
import { FULLDAY_PERIOD, MORNING_PERIOD, AFTERNOON_PERIOD } from '../hooks/constants/periods';

describe(getCurrentTriPeriod, () => {
  it('finds full day period for lowercase trigram', () => {
    const result = getCurrentTriPeriod(
      [{ tri: 'abc' }], [], [], 'abc',
    );
    expect(result).toBe(FULLDAY_PERIOD);
  });

  it('finds morning period for lowercase trigram', () => {
    const result = getCurrentTriPeriod(
      [], [{ tri: 'abc' }], [], 'abc',
    );
    expect(result).toBe(MORNING_PERIOD);
  });

  it('finds afternoon period for lowercase trigram', () => {
    const result = getCurrentTriPeriod(
      [], [], [{ tri: 'abc' }], 'abc',
    );
    expect(result).toBe(AFTERNOON_PERIOD);
  });

  it('returns undefined when trigram not found', () => {
    const result = getCurrentTriPeriod(
      [{ tri: 'xyz' }], [], [], 'abc',
    );
    expect(result).toBeUndefined();
  });

  // Bug regression: case-insensitive trigram matching
  it('finds full day period when stored trigram is uppercase', () => {
    const result = getCurrentTriPeriod(
      [{ tri: 'ABC' }], [], [], 'abc',
    );
    expect(result).toBe(FULLDAY_PERIOD);
  });

  it('finds full day period when own trigram is uppercase', () => {
    const result = getCurrentTriPeriod(
      [{ tri: 'abc' }], [], [], 'ABC',
    );
    expect(result).toBe(FULLDAY_PERIOD);
  });

  it('finds morning period with mixed case trigrams', () => {
    const result = getCurrentTriPeriod(
      [], [{ tri: 'Abc' }], [], 'ABC',
    );
    expect(result).toBe(MORNING_PERIOD);
  });

  it('finds afternoon period with mixed case trigrams', () => {
    const result = getCurrentTriPeriod(
      [], [], [{ tri: 'ABC' }], 'abc',
    );
    expect(result).toBe(AFTERNOON_PERIOD);
  });

  it('matches trigrams with leading/trailing whitespace', () => {
    const result = getCurrentTriPeriod(
      [{ tri: ' abc ' }], [], [], 'abc',
    );
    expect(result).toBe(FULLDAY_PERIOD);
  });
});

describe(getPresencesByPeriod, () => {
  it('separates presences by period', () => {
    const presences = [
      { tri: 'a', period: FULLDAY_PERIOD },
      { tri: 'b', period: MORNING_PERIOD },
      { tri: 'c', period: AFTERNOON_PERIOD },
      { tri: 'd' },
    ];
    const [fullDays, mornings, afternoons] = getPresencesByPeriod(presences);
    expect(fullDays).toHaveLength(2); // FULLDAY_PERIOD + no period
    expect(mornings).toHaveLength(1);
    expect(afternoons).toHaveLength(1);
  });

  it('includes null period presences in full day', () => {
    const presences = [{ tri: 'a', period: null }];
    const [fullDays] = getPresencesByPeriod(presences);
    expect(fullDays).toHaveLength(1);
  });

  it('includes empty string period presences in full day', () => {
    const presences = [{ tri: 'a', period: '' }];
    const [fullDays] = getPresencesByPeriod(presences);
    expect(fullDays).toHaveLength(1);
  });
});

describe(getCurrentPresence, () => {
  it('finds presence by trigram case-insensitively', () => {
    const presences = [{ tri: 'ABC', id: 1 }, { tri: 'xyz', id: 2 }];
    const result = getCurrentPresence(presences, 'abc');
    expect(result).toStrictEqual({ tri: 'ABC', id: 1 });
  });

  it('returns undefined when trigram not found', () => {
    const presences = [{ tri: 'xyz', id: 2 }];
    const result = getCurrentPresence(presences, 'abc');
    expect(result).toBeUndefined();
  });
});

describe(isCumulativeSpot, () => {
  it('returns true when spot is in cumulative list', () => {
    const cumulativeSpots = [{ Identifiant: 'spot-1' }, { Identifiant: 'spot-2' }];
    expect(isCumulativeSpot('spot-1', cumulativeSpots)).toBe(true);
  });

  it('returns false when spot is not in cumulative list', () => {
    const cumulativeSpots = [{ Identifiant: 'spot-1' }];
    expect(isCumulativeSpot('spot-99', cumulativeSpots)).toBe(false);
  });
});
