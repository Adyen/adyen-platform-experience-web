import { expect } from 'vitest';
import { TIMEZONE_PAST_DATES_TEST_ORIGIN_DATE } from './fixtures';
import type { RestamperWithTimezone, RestampResult } from '../types';
import { getGMTSuffixForTimezoneOffset, getSystemTimezoneGMTSuffixFromTimezoneOffsets } from '../utils';

export const getPastDatesMapForEachMonthInYear = (restamper: RestamperWithTimezone) => {
    const pastDate = new Date(TIMEZONE_PAST_DATES_TEST_ORIGIN_DATE);

    return new Map(
        Array.from({ length: 12 }, () => {
            pastDate.setMonth(pastDate.getMonth() + 1);
            return [pastDate.toISOString(), restamper(pastDate)];
        })
    );
};

export const runTimezoneTestRoutine = (timezoneOffset: RestampResult['offset'], systemTimezoneResult: RestampResult, result: RestampResult) => {
    if (result.formatted !== undefined) {
        const TimezoneGMTSuffix = getGMTSuffixForTimezoneOffset(timezoneOffset);
        expect(result.formatted).toMatch(TimezoneGMTSuffix);
    }

    if (systemTimezoneResult.formatted !== undefined) {
        const SystemTimezoneGMTSuffix = getSystemTimezoneGMTSuffixFromTimezoneOffsets(timezoneOffset, result.offset);
        expect(systemTimezoneResult.formatted).toMatch(SystemTimezoneGMTSuffix);
    }

    expect(result.timestamp).toBe(systemTimezoneResult.timestamp); // same time (hence, same timestamp)
};
