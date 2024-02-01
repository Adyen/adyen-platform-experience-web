export const DATES = [
    new Date('Feb 29, 2000, 11:30 PM GMT'),
    new Date('Apr 15, 2022, 1:30 PM GMT'),
    new Date('Dec 31, 2023, 5:30 PM GMT'),
    new Date('Jan 1, 2024, 3:30 AM GMT'),
];

// Each date is a start-of-day timestamp in the target timezone
export const TIMEZONES = new Map([
    [
        'America/Toronto',
        [
            new Date('Feb 29, 2000, 5:00 AM GMT'),
            new Date('Apr 15, 2022, 4:00 AM GMT'),
            new Date('Dec 31, 2023, 5:00 AM GMT'),
            new Date('Dec 31, 2023, 5:00 AM GMT'),
        ],
    ],
    [
        'Asia/Tokyo',
        [
            new Date('Feb 29, 2000, 3:00 PM GMT'),
            new Date('Apr 14, 2022, 3:00 PM GMT'),
            new Date('Dec 31, 2023, 3:00 PM GMT'),
            new Date('Dec 31, 2023, 3:00 PM GMT'),
        ],
    ],
]);

export const startOfDay = (date = new Date()) => date.setHours(0, 0, 0, 0);
