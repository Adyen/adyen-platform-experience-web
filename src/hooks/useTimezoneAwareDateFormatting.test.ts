/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/preact';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import useTimezoneAwareDateFormatting from './useTimezoneAwareDateFormatting';
import useCoreContext from '../core/Context/useCoreContext';
import Localization from '../core/Localization/Localization';

vi.mock('../core/Context/useCoreContext');

describe('useTimezoneAwareDateFormatting', () => {
    const mockUseCoreContext = vi.mocked(useCoreContext);

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(1703520645123); // Dec 25, 2023, 4:10:45.123 PM UTC
        mockUseCoreContext.mockReturnValue({ i18n: new Localization().i18n } as any);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    test('should return stable function references when timezone does not change', () => {
        const { result, rerender } = renderHook(() => useTimezoneAwareDateFormatting('America/New_York'));
        const initialResult = result.current;

        rerender();
        expect(result.current).toStrictEqual(initialResult);
    });

    test('should return new function references when timezone changes', () => {
        const { result, rerender } = renderHook(useTimezoneAwareDateFormatting, { initialProps: 'America/New_York' });
        const initialResult = result.current;

        rerender('Europe/London');
        expect(result.current).not.toStrictEqual(initialResult);
        expect(result.current).not.toEqual(initialResult);
    });

    test('should format dates correctly across DST and non-DST timezones', () => {
        const SUMMER_TIMESTAMP = 1688832645123; // July 8, 2023, 4:10:45.123 PM UTC (DST active)
        const WINTER_TIMESTAMP = 1703520645123; // Dec 25, 2023, 4:10:45.123 PM UTC

        const TIMEZONE_DATA = [
            {
                timezone: 'America/New_York',
                summer: { date: '07/08/2023', fullDate: 'Jul 08, 2023, 12:10:45' },
                winter: { date: '12/25/2023', fullDate: 'Dec 25, 2023, 11:10:45' },
            },
            {
                timezone: 'Europe/London',
                summer: { date: '07/08/2023', fullDate: 'Jul 08, 2023, 17:10:45' },
                winter: { date: '12/25/2023', fullDate: 'Dec 25, 2023, 16:10:45' },
            },
            {
                timezone: 'Asia/Tokyo',
                summer: { date: '07/09/2023', fullDate: 'Jul 09, 2023, 01:10:45' },
                winter: { date: '12/26/2023', fullDate: 'Dec 26, 2023, 01:10:45' },
            },
            {
                timezone: 'America/Los_Angeles',
                summer: { date: '07/08/2023', fullDate: 'Jul 08, 2023, 09:10:45' },
                winter: { date: '12/25/2023', fullDate: 'Dec 25, 2023, 08:10:45' },
            },
        ];

        TIMEZONE_DATA.forEach(({ timezone, winter, summer }) => {
            const { result } = renderHook(() => useTimezoneAwareDateFormatting(timezone));
            const { dateFormat, fullDateFormat } = result.current;

            expect(dateFormat(SUMMER_TIMESTAMP)).toBe(summer.date);
            expect(fullDateFormat(SUMMER_TIMESTAMP)).toBe(summer.fullDate);

            expect(dateFormat(WINTER_TIMESTAMP)).toBe(winter.date);
            expect(fullDateFormat(WINTER_TIMESTAMP)).toBe(winter.fullDate);
        });
    });

    test('should format dates correctly with custom options across timezones', () => {
        const DATE_FORMATS = [
            {
                options: { year: 'numeric', month: 'short', day: 'numeric', timeZoneName: 'short' } as const,
                expectations: {
                    'America/New_York': 'Dec 25, 2023, EST',
                    'Europe/London': 'Dec 25, 2023, GMT',
                    'Asia/Tokyo': 'Dec 26, 2023, GMT+9',
                    'America/Los_Angeles': 'Dec 25, 2023, PST',
                },
            },
            {
                options: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZoneName: 'long' } as const,
                expectations: {
                    'America/New_York': 'Monday, December 25, 2023 at Eastern Standard Time',
                    'Europe/London': 'Monday, December 25, 2023 at Greenwich Mean Time',
                    'Asia/Tokyo': 'Tuesday, December 26, 2023 at Japan Standard Time',
                    'America/Los_Angeles': 'Monday, December 25, 2023 at Pacific Standard Time',
                },
            },
            {
                options: { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'shortOffset' } as const,
                expectations: {
                    'America/New_York': '12/25/2023, 11:10:45 AM GMT-5',
                    'Europe/London': '12/25/2023, 04:10:45 PM GMT',
                    'Asia/Tokyo': '12/26/2023, 01:10:45 AM GMT+9',
                    'America/Los_Angeles': '12/25/2023, 08:10:45 AM GMT-8',
                },
            },
            {
                options: {
                    month: 'numeric',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZoneName: 'shortGeneric',
                } as const,
                expectations: {
                    'America/New_York': '12/25/2023, 11:10 AM ET',
                    'Europe/London': '12/25/2023, 4:10 PM United Kingdom Time',
                    'Asia/Tokyo': '12/26/2023, 1:10 AM Japan Time',
                    'America/Los_Angeles': '12/25/2023, 8:10 AM PT',
                },
            },
        ];

        DATE_FORMATS.forEach(({ options, expectations }) => {
            Object.entries(expectations).forEach(([timezone, expected]) => {
                const { result } = renderHook(() => useTimezoneAwareDateFormatting(timezone));
                expect(result.current.dateFormat(Date.now(), options)).toBe(expected);
            });
        });
    });

    test('should handle nullish timezones gracefully', () => {
        const currentTime = Date.now();
        const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const formatOptions = { month: 'short', day: 'numeric', year: 'numeric', timeZoneName: 'short' } as const;
        const systemTimezoneFormat = new Intl.DateTimeFormat('en-US', { ...formatOptions, timeZone: systemTimezone }).format(currentTime);

        // All nullish timezones should fall back to system timezone
        const { result: noParamResult } = renderHook(() => useTimezoneAwareDateFormatting());
        const { result: nullResult } = renderHook(() => useTimezoneAwareDateFormatting(null as any));
        const { result: undefinedResult } = renderHook(() => useTimezoneAwareDateFormatting(undefined));

        expect(noParamResult.current.dateFormat(currentTime, formatOptions)).toBe(systemTimezoneFormat);
        expect(nullResult.current.dateFormat(currentTime, formatOptions)).toBe(systemTimezoneFormat);
        expect(undefinedResult.current.dateFormat(currentTime, formatOptions)).toBe(systemTimezoneFormat);
    });

    test('should handle different forms of valid date inputs correctly', () => {
        const { result } = renderHook(() => useTimezoneAwareDateFormatting('Asia/Tokyo'));
        const { dateFormat } = result.current;

        // Same date but in different forms
        [Date.now(), new Date(), new Date().toISOString()].forEach(date => {
            expect(dateFormat(date)).toBe('12/26/2023');
        });
    });

    test('should handle invalid date inputs gracefully', () => {
        const { result } = renderHook(() => useTimezoneAwareDateFormatting());
        const { dateFormat, fullDateFormat } = result.current;

        // Invalid dates
        [new Date('unknown'), new Date('unknown').getTime()].forEach(invalidDate => {
            expect(dateFormat(invalidDate)).toBe('Invalid Date');
            expect(fullDateFormat(invalidDate)).toBe('Invalid Date');
        });
    });
});
