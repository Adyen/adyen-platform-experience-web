import { expect } from 'vitest';
import { TIMEZONE_PAST_DATES_TEST_ORIGIN_DATE } from './fixtures';
import type { RestamperWithTimezone, RestampResult } from '../types';
import { getGMTSuffixForTimezoneOffset, getSystemTimezoneGMTSuffixFromTimezoneOffsets } from '../utils';
import { isUndefined } from '../../../value/is';

export const getPastDatesMapForEachMonthInYear = (restamper: RestamperWithTimezone) => {
    const pastDate = new Date(TIMEZONE_PAST_DATES_TEST_ORIGIN_DATE);

    return new Map(
        Array.from({ length: 18 }, () => {
            pastDate.setMonth(pastDate.getMonth() + 1);
            return [pastDate.toISOString(), restamper(pastDate)];
        })
    );
};

export const runTimezoneTestRoutine = (timezoneOffset: RestampResult['offset'], systemTimezoneResult: RestampResult, result: RestampResult) => {
    if (!isUndefined(result.formatted)) {
        const timezoneGMTSuffix = getGMTSuffixForTimezoneOffset(timezoneOffset);
        expect(result.formatted).toMatch(timezoneGMTSuffix);
    }

    if (!isUndefined(systemTimezoneResult.formatted)) {
        const systemTimezoneGMTSuffix = getSystemTimezoneGMTSuffixFromTimezoneOffsets(timezoneOffset, result.offset);
        expect(systemTimezoneResult.formatted).toMatch(systemTimezoneGMTSuffix);
    }

    expect(result.timestamp).toBe(systemTimezoneResult.timestamp); // same time (hence, same timestamp)
};
