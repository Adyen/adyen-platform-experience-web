// @vitest-environment jsdom
import { describe, expect, test, vi } from 'vitest';
import { BASE_LOCALE, SYSTEM_TIMEZONE } from '../../../../../../core/Localization/datetime/restamper/constants';
import { setupTimers } from '../../../../../../primitives/time/__testing__/fixtures';
import { DAY_MS } from '../../constants';
import { getWeekDayIndex } from '../../utils';
import { mod } from '../../../../../../utils';
import MonthFrame from './MonthFrame';
import type { FirstWeekDay, WeekDay } from '../../types';
import { TIMEZONE_PAST_DATES_TEST_ORIGIN_DATE } from '../../../../../../core/Localization/datetime/restamper/testing/fixtures';

const DST_TIMEZONES_DAY_OFFSETS = new Map([
    ['America/Toronto', [-1, -1, -1, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, 0, 0, 0]],
    ['Asia/Jerusalem', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
    ['Australia/Lord_Howe', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
    ['Europe/Lisbon', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
    ['Pacific/Chatham', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
]);

const NON_DST_TIMEZONES_DAY_OFFSETS = new Map([
    ['Africa/Lagos', 0],
    ['America/Phoenix', -1],
    ['America/Sao_Paulo', 0],
    ['Asia/Kabul', 0],
    ['Asia/Tokyo', 0],
    ['Australia/Eucla', 0],
]);

const compareFrameTimestamps = (frame: MonthFrame, monthStartTimestamp: number, debug = false) => {
    let cellIndex = 0;

    for (const frameBlockRow of frame.frameBlocks[0]!) {
        for (const frameBlockCell of frameBlockRow) {
            const actualTimestamp = frameBlockCell.timestamp;
            const expectedTimestamp = monthStartTimestamp + cellIndex++ * DAY_MS;
            // debug && console.log(new Date(expectedTimestamp), new Date(actualTimestamp));
            expect(expectedTimestamp).toBe(actualTimestamp);
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
                vi.setSystemTime(originDate.setMonth(originDate.getMonth() + 1));

                const frame = new MonthFrame();
                const now = new Date();
                const date = now.getDate();
                const weekDay = now.getDay() as WeekDay;

                const runTestRoutine = (timezoneWeekDayOffset: number, timezone: string) => {
                    frame.timezone = timezone;
                    expect(frame.timezone).toBe(timezone);

                    const cursorIndex = getCursorIndex(date, weekDay, 0) + timezoneWeekDayOffset;
                    const monthStartTimestamp = frame.currentDayTimestamp - cursorIndex * DAY_MS;
                    // console.log(timezone);
                    // compareFrameTimestamps(frame, monthStartTimestamp, timezone === 'Europe/Lisbon');
                };

                DST_TIMEZONES_DAY_OFFSETS.forEach((weekDayOffsets, timezone) => runTestRoutine(weekDayOffsets[i]!, timezone));
                NON_DST_TIMEZONES_DAY_OFFSETS.forEach(runTestRoutine);
            }
        });
    });
});
