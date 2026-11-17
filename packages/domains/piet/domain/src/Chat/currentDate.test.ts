import { describe, expect, test } from 'vitest';
import { getCurrentDateInstruction } from './currentDate';

describe('getCurrentDateInstruction', () => {
    test('states the date as YYYY-MM-DD in the given time zone', () => {
        const now = new Date('2026-11-06T23:30:00Z');

        expect(getCurrentDateInstruction(now, 'UTC')).toContain("Today's date is 2026-11-06 (time zone UTC).");
        expect(getCurrentDateInstruction(now, 'Europe/Madrid')).toContain("Today's date is 2026-11-07 (time zone Europe/Madrid).");
        expect(getCurrentDateInstruction(now, 'America/Los_Angeles')).toContain("Today's date is 2026-11-06");
    });

    test('asks for both ends of a date filter', () => {
        const instruction = getCurrentDateInstruction(new Date('2026-11-06T12:00:00Z'), 'UTC');

        expect(instruction).toContain('always provide both the start and the end');
        expect(instruction).toContain('createdSince');
        expect(instruction).toContain('createdUntil');
    });

    test('does not include the time, so the prompt is stable during the day', () => {
        expect(getCurrentDateInstruction(new Date('2026-11-06T08:00:00Z'), 'UTC')).toBe(
            getCurrentDateInstruction(new Date('2026-11-06T20:00:00Z'), 'UTC')
        );
    });
});
