import { expect } from 'vitest';
import type { Restamp, RestampResult } from '@src/core/Localization/types';

/**
 * This date is the origin for generating the next sequence of 12 dates (same date per month in the next year).
 * Each DST timezone's offsets correspond to each of the 12 auto-generated dates in the sequence.
 * @see {getPastDatesMapForEachMonthInYear}
 * @see {DST_TIMEZONES}
 */
const TIMEZONE_PAST_DATES_TEST_ORIGIN_DATE = '2021-12-21 10:53:07 AM';

export type RestampContext = Readonly<{
    instance: Restamp;
    offsets: RestampResult['offsets'];
    timezone: Restamp['tz'];
}>;

/**
 * Offsets correspond to the dates auto-generated for each month of the year via the `getSystemTimezonePastDatesMapForEachMonthInYear` function.
 * @see {getPastDatesMapForEachMonthInYear}
 * @see {TIMEZONE_PAST_DATES_TEST_ORIGIN_DATE}
 */
export const DST_TIMEZONES = new Map([
    [
        'America/Toronto',
        [
            [-5, 0],
            [-5, 0],
            [-4, 0],
            [-4, 0],
            [-4, 0],
            [-4, 0],
            [-4, 0],
            [-4, 0],
            [-4, 0],
            [-4, 0],
            [-5, 0],
            [-5, 0],
        ],
    ],
    [
        'Asia/Jerusalem',
        [
            [2, 0],
            [2, 0],
            [2, 0],
            [3, 0],
            [3, 0],
            [3, 0],
            [3, 0],
            [3, 0],
            [3, 0],
            [3, 0],
            [2, 0],
            [2, 0],
        ],
    ],
    [
        'Australia/Lord_Howe',
        [
            [11, 0],
            [11, 0],
            [11, 0],
            [10, 30],
            [10, 30],
            [10, 30],
            [10, 30],
            [10, 30],
            [10, 30],
            [11, 0],
            [11, 0],
            [11, 0],
        ],
    ],
    [
        'Europe/Lisbon',
        [
            [0, 0],
            [0, 0],
            [0, 0],
            [1, 0],
            [1, 0],
            [1, 0],
            [1, 0],
            [1, 0],
            [1, 0],
            [1, 0],
            [0, 0],
            [0, 0],
        ],
    ],
    [
        'Pacific/Chatham',
        [
            [13, 45],
            [13, 45],
            [13, 45],
            [12, 45],
            [12, 45],
            [12, 45],
            [12, 45],
            [12, 45],
            [12, 45],
            [13, 45],
            [13, 45],
            [13, 45],
        ],
    ],
]);

/**
 * Offsets remain the same (fixed) for non-DST timezones.
 */
export const NON_DST_TIMEZONES = new Map([
    ['Africa/Lagos', [1, 0] as const],
    ['America/Phoenix', [-7, 0] as const],
    ['America/Sao_Paulo', [-3, 0] as const],
    ['Asia/Kabul', [4, 30] as const],
    ['Asia/Tokyo', [9, 0] as const],
    ['Australia/Eucla', [8, 45] as const],
]);

export const getPastDatesMapForEachMonthInYear = (instance: Restamp) => {
    const pastDate = new Date(TIMEZONE_PAST_DATES_TEST_ORIGIN_DATE);

    return new Map(
        Array.from({ length: 12 }, () => {
            pastDate.setMonth(pastDate.getMonth() + 1);
            return [pastDate.toISOString(), instance(pastDate)];
        })
    );
};

/**
 * @param offsets {array} The hour and minute offsets relative to GMT (Greenwich Mean Time).
 * @returns {string} The GMT suffixed string for the specified offsets in the format GMT(+|-)[HH]:[MM], or just GMT (if [HH]:[MM] is 00:00).
 */
export const getGMTSuffixForOffsets = (offsets: RestampResult['offsets']): string => {
    const offsetString = offsets.map(offset => `${offset}`.replace(/(?<=^\D?)(\d)$/, '0$1')).join(':');
    return `GMT+${offsetString}`.replace(/\+(?=-)|([+-]00:00)/g, '');
};

/**
 * @param timezoneOffsets {array} The hour and minute offsets of the timezone relative to GMT (Greenwich Mean Time).
 * @param timezoneOffsetsRelativeToSystem {array} The hour and minute offsets of the timezone relative to the system timezone.
 * @returns {string} The system timezone GMT suffixed string in the format GMT(+|-)[HH]:[MM], or just GMT (if [HH]:[MM] is 00:00).
 */
export const getSystemTimezoneGMTSuffixFromOffsets = (
    timezoneOffsets: RestampResult['offsets'],
    timezoneOffsetsRelativeToSystem: RestampResult['offsets']
): string => {
    let [hourOffset, minuteOffset] = Object.freeze(
        timezoneOffsets.map((offset, index) => offset - (timezoneOffsetsRelativeToSystem[index] as number))
    ) as typeof timezoneOffsets;

    if (minuteOffset < 0) {
        minuteOffset = (60 + (minuteOffset % 60)) % 60; // modulus (mod-60) for minute offset
        timezoneOffsets[0] < 0 ? (hourOffset -= 1) : (hourOffset += 1); // hour offset correction
    }

    return getGMTSuffixForOffsets([hourOffset, minuteOffset]);
};

export const runTimezoneTestRoutine = (timezoneOffsets: RestampResult['offsets'], systemTimezoneResult: RestampResult, result: RestampResult) => {
    if (result.formatted !== undefined) {
        const TimezoneGMTSuffix = getGMTSuffixForOffsets(timezoneOffsets);
        expect(result.formatted).toMatch(TimezoneGMTSuffix);
    }

    if (systemTimezoneResult.formatted !== undefined) {
        const SystemTimezoneGMTSuffix = getSystemTimezoneGMTSuffixFromOffsets(timezoneOffsets, result.offsets);
        expect(systemTimezoneResult.formatted).toMatch(SystemTimezoneGMTSuffix);
    }

    expect(result.timestamp).toBe(systemTimezoneResult.timestamp); // same time (hence, same timestamp)
};
