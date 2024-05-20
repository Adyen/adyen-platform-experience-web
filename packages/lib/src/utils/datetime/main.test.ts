import { describe, expect, test } from 'vitest';
import { parseDate } from './main';

describe('parseDate', () => {
    test('should return `undefined` if no argument is provided', () => {
        expect(parseDate()).toBeUndefined();
    });

    test('should handle arguments passed to it just like the native `Date` constructor', () => {
        [
            [628021800000],
            ['1995-12-17T03:24:00'],
            ['December 17, 1995 03:24:00'], // (non-standard date string)
            [1995, 11, 17],
            [1995, 11, 17, 3, 24, 0],
        ].forEach(args => expect(parseDate(...args)).toBe(new Date(...(args as [])).getTime()));
    });

    test('should return timestamp of `Date` object if valid, and `undefined` otherwise', () => {
        // Valid dates
        [
            new Date(),
            new Date(628021800000),
            new Date('1995-12-17T03:24:00'),
            new Date('December 17, 1995 03:24:00'), // (non-standard date string)
            new Date(1995, 11, 17),
            new Date(1995, 11, 17, 3, 24, 0),
        ].forEach(date => expect(parseDate(date)).toBe(date.getTime()));

        // Invalid dates
        [NaN, Infinity, -Infinity, undefined, 'hello_world', ''].forEach(date => {
            expect(parseDate(new Date(date!))).toBeUndefined();
        });
    });

    test('should return specified timestamp if within the timestamp range, and `undefined` otherwise', () => {
        const MAX_DATE_TIMESTAMP = 8.64e15;
        const MIN_DATE_TIMESTAMP = -8.64e15;
        const randomTimestamps = new Set<number>();

        for (let i = 0; i < 50; i++) {
            const random = Math.floor(Math.random() * MAX_DATE_TIMESTAMP);
            const timestamp = random * (Math.floor(Math.random() * 2) ? 1 : -1);

            if (!randomTimestamps.has(timestamp)) {
                expect(parseDate(timestamp)).toBe(timestamp);
                randomTimestamps.add(timestamp);
            } else --i;
        }

        // max and min timestamps
        expect(parseDate(MAX_DATE_TIMESTAMP)).toBe(MAX_DATE_TIMESTAMP);
        expect(parseDate(MIN_DATE_TIMESTAMP)).toBe(MIN_DATE_TIMESTAMP);

        // out of range timestamps
        expect(parseDate(MAX_DATE_TIMESTAMP + 1)).toBeUndefined();
        expect(parseDate(MIN_DATE_TIMESTAMP - 1)).toBeUndefined();
    });
});
