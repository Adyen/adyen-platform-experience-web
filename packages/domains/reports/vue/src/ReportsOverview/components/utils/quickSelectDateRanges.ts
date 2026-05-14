type QuickSelectDateRange = {
    startDate: Date;
    endDate: Date;
    range: string;
};

export function startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function endOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

function endOfPreviousDay(date: Date): Date {
    const d = startOfDay(date);
    d.setMilliseconds(d.getMilliseconds() - 1);
    return d;
}

function subDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() - days);
    return startOfDay(d);
}

function startOfWeek(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = (day - 1 + 7) % 7;
    d.setDate(d.getDate() - diff);
    return d;
}

function startOfMonth(date: Date): Date {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}

function startOfYear(date: Date): Date {
    const d = new Date(date);
    d.setMonth(0, 1);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getLastWeekStartDate() {
    const d = startOfWeek(now);
    d.setDate(d.getDate() - 7);
    return d;
}

function getLastMonthStartDate() {
    const d = startOfMonth(now);
    d.setMonth(d.getMonth() - 1);
    return d;
}

export const now = endOfDay(new Date());

export const dateWithoutTimezone = (date: Date) => {
    const tzoffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
    const withoutTimezone = new Date(date.valueOf() - tzoffset).toISOString().slice(0, -1);
    return withoutTimezone;
};

export const toUTCISOStringKeepingLocalDateTime = (date: Date) => {
    return new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
    ).toISOString();
};

export const quickSelectDateRanges = {
    last7Days: {
        startDate: subDays(now, 6),
        endDate: now,
        range: 'last7Days',
    },
    last30Days: {
        startDate: subDays(now, 29),
        endDate: now,
        range: 'last30Days',
    },
    last180Days: {
        startDate: subDays(now, 179),
        endDate: now,
        range: 'last180Days',
    },
    thisWeek: {
        startDate: startOfWeek(now),
        endDate: now,
        range: 'thisWeek',
    },
    lastWeek: {
        startDate: getLastWeekStartDate(),
        endDate: endOfPreviousDay(startOfWeek(now)),
        range: 'lastWeek',
    },
    thisMonth: {
        startDate: startOfMonth(now),
        endDate: now,
        range: 'thisMonth',
    },
    lastMonth: {
        startDate: getLastMonthStartDate(),
        endDate: endOfPreviousDay(startOfMonth(now)),
        range: 'lastMonth',
    },
    yearToDate: {
        startDate: startOfYear(now),
        endDate: now,
        range: 'yearToDate',
    },
} as const satisfies Record<string, QuickSelectDateRange>;
