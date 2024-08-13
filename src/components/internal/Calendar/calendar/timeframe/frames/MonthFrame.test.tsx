// @vitest-environment jsdom
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { BASE_LOCALE, SYSTEM_TIMEZONE } from '../../../../../../core/Localization/datetime/restamper/constants';
import { DAY_MS } from '../../constants';
import { getWeekDayIndex } from '../../utils';
import MonthFrame from './MonthFrame';
import type { WeekDay } from '../../types';

describe('MonthFrame', () => {
    test('should have correct initial state', () => {
        const frame = new MonthFrame();
        const today = new Date();
        const todayTimestamp = today.setHours(0, 0, 0, 0);
        const weekDayToday = today.getDay() as WeekDay;

        expect(frame.currentDayTimestamp).toBe(todayTimestamp);
        expect(frame.cursor).toBe(getWeekDayIndex(weekDayToday, 0) + Math.ceil(today.getDate() / 7) * 7);

        // allowed values for firstWeekDay: 0, 1, 6
        for (const firstWeekDay of [0, 1, 6] as const) {
            const weekDayOffset = getWeekDayIndex(weekDayToday, firstWeekDay);
            const cursorIndex = weekDayOffset + Math.ceil(today.getDate() / 7) * 7;
            const monthStartTimestamp = todayTimestamp - cursorIndex * DAY_MS;

            frame.firstWeekDay = firstWeekDay;

            expect(frame.cursor).toBe(cursorIndex);
            expect(frame.firstWeekDay).toBe(firstWeekDay);

            expect(frame.blankSelection).toBe(true);
            expect(frame.currentDayTimestamp).toBe(todayTimestamp);
            expect(frame.daysOfWeek.length).toBe(7);
            expect(frame.dynamicBlockHeight).toBe(false);
            expect(frame.frameBlocks.length).toBe(1);
            expect(frame.isAtStart).toBe(false);
            expect(frame.isAtEnd).toBe(false);
            expect(frame.locale).toBe(BASE_LOCALE);
            expect(frame.rowspan).toBe(7);
            expect(frame.selectionStart).toBeUndefined();
            expect(frame.selectionEnd).toBeUndefined();
            expect(frame.size).toBe(1);
            expect(frame.timezone).toBe(SYSTEM_TIMEZONE);
            expect(frame.timeslice.from).toBe(-Infinity);
            expect(frame.timeslice.to).toBe(Infinity);
            expect(frame.units).toBe(42);

            let cellIndex = 0;

            for (const frameBlockRow of frame.frameBlocks[0]!) {
                for (const frameBlockCell of frameBlockRow) {
                    const actualTimestamp = frameBlockCell.timestamp;
                    const expectedTimestamp = monthStartTimestamp + cellIndex++ * DAY_MS;
                    expect(expectedTimestamp).toBe(actualTimestamp);
                }
            }
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
});
