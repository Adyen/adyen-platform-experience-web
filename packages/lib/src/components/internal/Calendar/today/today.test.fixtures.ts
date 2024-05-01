import { afterAll, beforeAll, beforeEach, vi } from 'vitest';

export const DATES = [
    new Date('Feb 29, 2000, 11:30 PM GMT'),
    new Date('Apr 15, 2022, 1:30 PM GMT'),
    new Date('Dec 31, 2023, 5:30 PM GMT'),
    new Date('Jan 1, 2025, 3:30 AM GMT'),
];

// Each date is a start-of-day timestamp in the target timezone
export const TIMEZONES = new Map([
    [
        'America/Toronto',
        [
            new Date('Feb 29, 2000, 5:00 AM GMT'),
            new Date('Apr 15, 2022, 4:00 AM GMT'),
            new Date('Dec 31, 2023, 5:00 AM GMT'),
            new Date('Dec 31, 2024, 5:00 AM GMT'),
        ],
    ],
    [
        'Asia/Tokyo',
        [
            new Date('Feb 29, 2000, 3:00 PM GMT'),
            new Date('Apr 14, 2022, 3:00 PM GMT'),
            new Date('Dec 31, 2023, 3:00 PM GMT'),
            new Date('Dec 31, 2024, 3:00 PM GMT'),
        ],
    ],
]);

export const startOfDay = (date: Date | number = Date.now()) => new Date(date).setHours(0, 0, 0, 0);

export const startOfNextDay = (startDateOfDay: Date | number = startOfDay()) => {
    const startDate = new Date(startDateOfDay);
    return startDate.setDate(startDate.getDate() + 1);
};

export const initialize = () => {
    const watchFn = vi.fn();

    beforeEach(() => {
        watchFn.mockRestore();
        vi.setSystemTime(0);
    });

    beforeAll(() => {
        vi.useFakeTimers();
        vi.stubGlobal(
            'document',
            Object.assign({}, document, {
                timeline: { currentTime: undefined },
            })
        );
    });

    afterAll(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    return { watchFn } as const;
};
