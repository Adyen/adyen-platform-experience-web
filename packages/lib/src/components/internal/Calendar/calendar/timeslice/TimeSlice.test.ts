import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { RANGE_FROM, RANGE_TO } from '../constants';
import type { Time } from '../types';
import TimeSlice from './TimeSlice';

describe('TimeSlice', () => {
    let DATES: readonly Time[];

    beforeAll(() => {
        vi.useFakeTimers();

        DATES = Object.freeze([
            Date.now(),
            1075663782022,
            '2000-02-29 22:15:43.124 GMT',
            new Date('2004-04-30 12:23:06 PM GMT'),
            new Date(2020, 1, 29, 22, 15, 43, 124),
        ]);
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    test('should be unbounded on both time-edges when called without arguments', () => {
        const timeslice = new TimeSlice();

        expect(timeslice.startTimestamp).toBe(-Infinity);
        expect(timeslice.endTimestamp).toBe(Infinity);
        expect(timeslice.numberOfMonths).toBe(Infinity);

        expect(timeslice.startTimestampOffset).toBe(0);
        expect(timeslice.endTimestampOffset).toBe(0);
    });

    test('should be unbounded only on the end time-edge when called with only a time argument', () => {
        DATES.forEach(time => {
            const timeslice = new TimeSlice(time);
            const timestamp = new Date(time).getTime();
            const timeOffset = timestamp - new Date(time).setHours(0, 0, 0, 0);

            expect(timeslice.startTimestamp).toBe(timestamp);
            expect(timeslice.endTimestamp).toBe(Infinity);
            expect(timeslice.numberOfMonths).toBe(Infinity);

            expect(timeslice.startTimestampOffset).toBe(timeOffset);
            expect(timeslice.endTimestampOffset).toBe(0);
        });
    });

    test('should be unbounded on one time-edge when called with a time and a time-edge symbol', () => {
        DATES.forEach(time => {
            const timeslice1 = new TimeSlice(time, RANGE_FROM);
            const timeslice2 = new TimeSlice(time, RANGE_TO);
            const timestamp = new Date(time).getTime();
            const timeOffset = timestamp - new Date(time).setHours(0, 0, 0, 0);

            expect(timeslice1.startTimestamp).toBe(timestamp);
            expect(timeslice2.startTimestamp).toBe(-Infinity);

            expect(timeslice1.endTimestamp).toBe(Infinity);
            expect(timeslice2.endTimestamp).toBe(timestamp);

            expect(timeslice1.numberOfMonths).toBe(Infinity);
            expect(timeslice2.numberOfMonths).toBe(Infinity);

            expect(timeslice1.startTimestampOffset).toBe(timeOffset);
            expect(timeslice2.startTimestampOffset).toBe(0);

            expect(timeslice1.endTimestampOffset).toBe(0);
            expect(timeslice2.endTimestampOffset).toBe(timeOffset);
        });
    });
});
