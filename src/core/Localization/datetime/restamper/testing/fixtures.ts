import type { RestamperWithTimezone, RestampResult } from '../types';

export type RestamperTestContext = Readonly<{
    restamper: RestamperWithTimezone;
    offset: RestampResult['offset'];
    timezone: RestamperWithTimezone['tz'];
}>;

/**
 * This date is the origin for generating the next sequence of 18 dates (same date per month starting from next month).
 * Each DST timezone's offsets correspond to each of the 18 auto-generated dates in the sequence.
 * @see {getPastDatesMapForEachMonthInYear}
 * @see {DST_TIMEZONES}
 */
export const TIMEZONE_PAST_DATES_TEST_ORIGIN_DATE = '2019-12-02T04:53:07.000Z';

/**
 * Offsets correspond to the dates auto-generated for each month of the year via the `getSystemTimezonePastDatesMapForEachMonthInYear` function.
 * @see {getPastDatesMapForEachMonthInYear}
 * @see {TIMEZONE_PAST_DATES_TEST_ORIGIN_DATE}
 */
export const DST_TIMEZONES = new Map([
    ['America/Toronto', [-300, -300, -300, -240, -240, -240, -240, -240, -240, -240, -300, -300, -300, -300, -300, -240, -240, -240]],
    ['Asia/Jerusalem', [120, 120, 120, 180, 180, 180, 180, 180, 180, 180, 120, 120, 120, 120, 120, 180, 180, 180]],
    ['Australia/Lord_Howe', [660, 660, 660, 660, 630, 630, 630, 630, 630, 630, 660, 660, 660, 660, 660, 660, 630, 630]],
    ['Europe/Lisbon', [0, 0, 0, 60, 60, 60, 60, 60, 60, 60, 0, 0, 0, 0, 0, 60, 60, 60]],
    ['Pacific/Chatham', [825, 825, 825, 825, 765, 765, 765, 765, 765, 825, 825, 825, 825, 825, 825, 825, 765, 765]],
]);

/**
 * Offsets remain the same (fixed) for non-DST timezones.
 */
export const NON_DST_TIMEZONES = new Map([
    ['Africa/Lagos', 60],
    ['America/Phoenix', -420],
    ['America/Sao_Paulo', -180],
    ['Asia/Kabul', 270],
    ['Asia/Tokyo', 540],
    ['Australia/Eucla', 525],
]);
