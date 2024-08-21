// @vitest-environment jsdom
import { describe, expect, test, vi } from 'vitest';
import { BASE_LOCALE, SYSTEM_TIMEZONE } from '../../../../../../core/Localization/datetime/restamper/constants';
import { TIMEZONE_PAST_DATES_TEST_ORIGIN_DATE } from '../../../../../../core/Localization/datetime/restamper/testing/fixtures';
import { setupTimers } from '../../../../../../primitives/time/__testing__/fixtures';
import { DAY_MS } from '../../constants';
import { getWeekDayIndex } from '../../utils';
import { mod } from '../../../../../../utils';
import MonthFrame from './MonthFrame';
import type { FirstWeekDay, WeekDay } from '../../types';

const DST_TIMEZONES_DATES = new Map([
    [
        'America/Toronto',
        [
            '2019-12-29T05:00:00.000Z',
            '2020-01-26T05:00:00.000Z',
            '2020-03-01T05:00:00.000Z',
            '2020-03-29T04:00:00.000Z',
            '2020-04-26T04:00:00.000Z',
            '2020-05-31T04:00:00.000Z',
            '2020-06-28T04:00:00.000Z',
            '2020-07-26T04:00:00.000Z',
            '2020-08-30T04:00:00.000Z',
            '2020-09-27T04:00:00.000Z',
            '2020-11-01T04:00:00.000Z',
            '2020-11-29T05:00:00.000Z',
            '2020-12-27T05:00:00.000Z',
            '2021-01-31T05:00:00.000Z',
            '2021-02-28T05:00:00.000Z',
            '2021-03-28T04:00:00.000Z',
            '2021-04-25T04:00:00.000Z',
            '2021-05-30T04:00:00.000Z',
        ],
    ],
    [
        'Asia/Jerusalem',
        [
            '2019-12-28T22:00:00.000Z',
            '2020-01-25T22:00:00.000Z',
            '2020-02-29T22:00:00.000Z',
            '2020-03-28T21:00:00.000Z',
            '2020-04-25T21:00:00.000Z',
            '2020-05-30T21:00:00.000Z',
            '2020-06-27T21:00:00.000Z',
            '2020-07-25T21:00:00.000Z',
            '2020-08-29T21:00:00.000Z',
            '2020-09-26T21:00:00.000Z',
            '2020-10-31T22:00:00.000Z',
            '2020-11-28T22:00:00.000Z',
            '2020-12-26T22:00:00.000Z',
            '2021-01-30T22:00:00.000Z',
            '2021-02-27T22:00:00.000Z',
            '2021-03-27T21:00:00.000Z',
            '2021-04-24T21:00:00.000Z',
            '2021-05-29T21:00:00.000Z',
        ],
    ],
    [
        'Australia/Lord_Howe',
        [
            '2019-12-28T13:00:00.000Z',
            '2020-01-25T13:00:00.000Z',
            '2020-02-29T13:00:00.000Z',
            '2020-03-28T13:00:00.000Z',
            '2020-04-25T13:30:00.000Z',
            '2020-05-30T13:30:00.000Z',
            '2020-06-27T13:30:00.000Z',
            '2020-07-25T13:30:00.000Z',
            '2020-08-29T13:30:00.000Z',
            '2020-09-26T13:30:00.000Z',
            '2020-10-31T13:00:00.000Z',
            '2020-11-28T13:00:00.000Z',
            '2020-12-26T13:00:00.000Z',
            '2021-01-30T13:00:00.000Z',
            '2021-02-27T13:00:00.000Z',
            '2021-03-27T13:00:00.000Z',
            '2021-04-24T13:30:00.000Z',
            '2021-05-29T13:30:00.000Z',
        ],
    ],
    // ['Europe/Lisbon', [
    //     '2019-12-29T00:00:00.000Z',
    //     '2020-01-26T00:00:00.000Z',
    //     '2020-03-01T00:00:00.000Z',
    //     '2020-03-28T23:00:00.000Z',
    //     '2020-04-25T23:00:00.000Z',
    //     '2020-05-30T23:00:00.000Z',
    //     '2020-06-27T23:00:00.000Z',
    //     '2020-07-25T23:00:00.000Z',
    //     '2020-08-29T23:00:00.000Z',
    //     '2020-09-26T23:00:00.000Z',
    //     '2020-11-01T00:00:00.000Z',
    //     '2020-11-29T00:00:00.000Z',
    //     '2020-12-27T00:00:00.000Z',
    //     '2021-01-31T00:00:00.000Z',
    //     '2021-02-28T00:00:00.000Z',
    //     '2021-03-27T23:00:00.000Z',
    //     '2021-04-24T23:00:00.000Z',
    //     '2021-05-29T23:00:00.000Z',
    // ]],
    [
        'Pacific/Chatham',
        [
            '2019-12-28T10:15:00.000Z',
            '2020-01-25T10:15:00.000Z',
            '2020-02-29T10:15:00.000Z',
            '2020-03-28T10:15:00.000Z',
            '2020-04-25T11:15:00.000Z',
            '2020-05-30T11:15:00.000Z',
            '2020-06-27T11:15:00.000Z',
            '2020-07-25T11:15:00.000Z',
            '2020-08-29T11:15:00.000Z',
            '2020-09-26T10:15:00.000Z',
            '2020-10-31T10:15:00.000Z',
            '2020-11-28T10:15:00.000Z',
            '2020-12-26T10:15:00.000Z',
            '2021-01-30T10:15:00.000Z',
            '2021-02-27T10:15:00.000Z',
            '2021-03-27T10:15:00.000Z',
            '2021-04-24T11:15:00.000Z',
            '2021-05-29T11:15:00.000Z',
        ],
    ],
]);

const NON_DST_TIMEZONES_DATES = new Map([
    [
        'Africa/Lagos',
        [
            '2019-12-28T23:00:00.000Z',
            '2020-01-25T23:00:00.000Z',
            '2020-02-29T23:00:00.000Z',
            '2020-03-28T23:00:00.000Z',
            '2020-04-25T23:00:00.000Z',
            '2020-05-30T23:00:00.000Z',
            '2020-06-27T23:00:00.000Z',
            '2020-07-25T23:00:00.000Z',
            '2020-08-29T23:00:00.000Z',
            '2020-09-26T23:00:00.000Z',
            '2020-10-31T23:00:00.000Z',
            '2020-11-28T23:00:00.000Z',
            '2020-12-26T23:00:00.000Z',
            '2021-01-30T23:00:00.000Z',
            '2021-02-27T23:00:00.000Z',
            '2021-03-27T23:00:00.000Z',
            '2021-04-24T23:00:00.000Z',
            '2021-05-29T23:00:00.000Z',
        ],
    ],
    [
        'America/Phoenix',
        [
            '2019-12-29T07:00:00.000Z',
            '2020-01-26T07:00:00.000Z',
            '2020-03-01T07:00:00.000Z',
            '2020-03-29T07:00:00.000Z',
            '2020-04-26T07:00:00.000Z',
            '2020-05-31T07:00:00.000Z',
            '2020-06-28T07:00:00.000Z',
            '2020-07-26T07:00:00.000Z',
            '2020-08-30T07:00:00.000Z',
            '2020-09-27T07:00:00.000Z',
            '2020-11-01T07:00:00.000Z',
            '2020-11-29T07:00:00.000Z',
            '2020-12-27T07:00:00.000Z',
            '2021-01-31T07:00:00.000Z',
            '2021-02-28T07:00:00.000Z',
            '2021-03-28T07:00:00.000Z',
            '2021-04-25T07:00:00.000Z',
            '2021-05-30T07:00:00.000Z',
        ],
    ],
    [
        'America/Sao_Paulo',
        [
            '2019-12-29T03:00:00.000Z',
            '2020-01-26T03:00:00.000Z',
            '2020-03-01T03:00:00.000Z',
            '2020-03-29T03:00:00.000Z',
            '2020-04-26T03:00:00.000Z',
            '2020-05-31T03:00:00.000Z',
            '2020-06-28T03:00:00.000Z',
            '2020-07-26T03:00:00.000Z',
            '2020-08-30T03:00:00.000Z',
            '2020-09-27T03:00:00.000Z',
            '2020-11-01T03:00:00.000Z',
            '2020-11-29T03:00:00.000Z',
            '2020-12-27T03:00:00.000Z',
            '2021-01-31T03:00:00.000Z',
            '2021-02-28T03:00:00.000Z',
            '2021-03-28T03:00:00.000Z',
            '2021-04-25T03:00:00.000Z',
            '2021-05-30T03:00:00.000Z',
        ],
    ],
    [
        'Asia/Kabul',
        [
            '2019-12-28T19:30:00.000Z',
            '2020-01-25T19:30:00.000Z',
            '2020-02-29T19:30:00.000Z',
            '2020-03-28T19:30:00.000Z',
            '2020-04-25T19:30:00.000Z',
            '2020-05-30T19:30:00.000Z',
            '2020-06-27T19:30:00.000Z',
            '2020-07-25T19:30:00.000Z',
            '2020-08-29T19:30:00.000Z',
            '2020-09-26T19:30:00.000Z',
            '2020-10-31T19:30:00.000Z',
            '2020-11-28T19:30:00.000Z',
            '2020-12-26T19:30:00.000Z',
            '2021-01-30T19:30:00.000Z',
            '2021-02-27T19:30:00.000Z',
            '2021-03-27T19:30:00.000Z',
            '2021-04-24T19:30:00.000Z',
            '2021-05-29T19:30:00.000Z',
        ],
    ],
    [
        'Asia/Tokyo',
        [
            '2019-12-28T15:00:00.000Z',
            '2020-01-25T15:00:00.000Z',
            '2020-02-29T15:00:00.000Z',
            '2020-03-28T15:00:00.000Z',
            '2020-04-25T15:00:00.000Z',
            '2020-05-30T15:00:00.000Z',
            '2020-06-27T15:00:00.000Z',
            '2020-07-25T15:00:00.000Z',
            '2020-08-29T15:00:00.000Z',
            '2020-09-26T15:00:00.000Z',
            '2020-10-31T15:00:00.000Z',
            '2020-11-28T15:00:00.000Z',
            '2020-12-26T15:00:00.000Z',
            '2021-01-30T15:00:00.000Z',
            '2021-02-27T15:00:00.000Z',
            '2021-03-27T15:00:00.000Z',
            '2021-04-24T15:00:00.000Z',
            '2021-05-29T15:00:00.000Z',
        ],
    ],
    [
        'Australia/Eucla',
        [
            '2019-12-28T15:15:00.000Z',
            '2020-01-25T15:15:00.000Z',
            '2020-02-29T15:15:00.000Z',
            '2020-03-28T15:15:00.000Z',
            '2020-04-25T15:15:00.000Z',
            '2020-05-30T15:15:00.000Z',
            '2020-06-27T15:15:00.000Z',
            '2020-07-25T15:15:00.000Z',
            '2020-08-29T15:15:00.000Z',
            '2020-09-26T15:15:00.000Z',
            '2020-10-31T15:15:00.000Z',
            '2020-11-28T15:15:00.000Z',
            '2020-12-26T15:15:00.000Z',
            '2021-01-30T15:15:00.000Z',
            '2021-02-27T15:15:00.000Z',
            '2021-03-27T15:15:00.000Z',
            '2021-04-24T15:15:00.000Z',
            '2021-05-29T15:15:00.000Z',
        ],
    ],
]);

const compareFrameTimestamps = (frame: MonthFrame, monthStartDate: Date | number) => {
    const currentDate = new Date(monthStartDate);
    let currentTimeOffset = currentDate.getTimezoneOffset();

    for (const frameBlockRow of frame.frameBlocks[0]!) {
        for (const frameBlockCell of frameBlockRow) {
            const systemTimeOffset = (currentTimeOffset - (currentTimeOffset = currentDate.getTimezoneOffset())) * 60000;
            const expectedTimestamp = currentDate.setTime(currentDate.getTime() + systemTimeOffset);
            const actualTimestamp = frameBlockCell.timestamp;
            // console.log(new Date(expectedTimestamp), new Date(actualTimestamp));
            expect(expectedTimestamp).toBe(actualTimestamp);
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }
};

const getCursorIndex = (date: number, weekDay: WeekDay, firstWeekDay: FirstWeekDay = 0) => {
    const dateIndex = date - 1;
    return dateIndex + mod(getWeekDayIndex(weekDay, firstWeekDay) - (dateIndex % 7), 7);
};

describe('MonthFrame', () => {
    setupTimers();

    test('should have correct initial state', () => {
        const frame = new MonthFrame();
        const now = new Date();
        const date = now.getDate();
        const weekDay = now.getDay() as WeekDay;
        const todayTimestamp = now.setHours(0, 0, 0, 0);

        expect(frame.currentDayTimestamp).toBe(todayTimestamp);
        expect(frame.cursor).toBe(getCursorIndex(date, weekDay, 0));

        // allowed values for firstWeekDay: 0, 1, 6
        for (const firstWeekDay of [0, 1, 6] as const) {
            const cursorIndex = getCursorIndex(date, weekDay, firstWeekDay);
            const monthStartTimestamp = todayTimestamp - cursorIndex * DAY_MS;

            frame.firstWeekDay = firstWeekDay;

            expect(frame.cursor).toBe(cursorIndex);
            expect(frame.firstWeekDay).toBe(firstWeekDay);

            expect(frame.blankSelection).toBe(true);
            expect(frame.selectionStart).toBeUndefined();
            expect(frame.selectionEnd).toBeUndefined();

            expect(frame.isAtStart).toBe(false);
            expect(frame.isAtEnd).toBe(false);
            expect(frame.timeslice.from).toBe(-Infinity);
            expect(frame.timeslice.to).toBe(Infinity);

            expect(frame.currentDayTimestamp).toBe(todayTimestamp);
            expect(frame.daysOfWeek.length).toBe(7);
            expect(frame.rowspan).toBe(7);

            expect(frame.locale).toBe(BASE_LOCALE);
            expect(frame.timezone).toBe(SYSTEM_TIMEZONE);

            expect(frame.dynamicBlockHeight).toBe(false);
            expect(frame.frameBlocks.length).toBe(1);
            expect(frame.size).toBe(1);
            expect(frame.units).toBe(42);

            compareFrameTimestamps(frame, monthStartTimestamp);
        }

        frame.firstWeekDay = 1;
        expect(frame.firstWeekDay).toBe(1);

        // setting to `null` should reset it to `0`
        frame.firstWeekDay = null;
        expect(frame.firstWeekDay).toBe(0);

        frame.firstWeekDay = 6;
        expect(frame.firstWeekDay).toBe(6);

        // setting to `undefined` should reset it to `0`
        frame.firstWeekDay = undefined;
        expect(frame.firstWeekDay).toBe(0);
    });

    describe('timezones', () => {
        test('should render correct dates for timezones', () => {
            const originDate = new Date(TIMEZONE_PAST_DATES_TEST_ORIGIN_DATE);

            for (let i = 0; i < 18; i++) {
                vi.setSystemTime(originDate.setUTCMonth(originDate.getUTCMonth() + 1));

                const frame = new MonthFrame();

                const runTestRoutine = (monthStartDates: string[], timezone: string) => {
                    frame.timezone = timezone;
                    frame.shiftFrameToTimestamp();

                    expect(frame.timezone).toBe(timezone);
                    compareFrameTimestamps(frame, new Date(monthStartDates[i]!));
                };

                DST_TIMEZONES_DATES.forEach(runTestRoutine);
                NON_DST_TIMEZONES_DATES.forEach(runTestRoutine);
            }
        });
    });
});
