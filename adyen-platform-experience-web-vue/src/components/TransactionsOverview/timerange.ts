/**
 * Simplified timerange utilities ported from the Preact Calendar internals.
 * These provide the RangeTimestamps factory and preset functions needed by
 * the TransactionsOverview constants and date filter.
 */

import type { RangeTimestamps } from './types';

// ── Helpers ──

function startOfDay(timestamp: number, _timezone?: string): number {
    const d = new Date(timestamp);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

function startOfWeek(timestamp: number, _timezone?: string, firstWeekDay: number = 1): number {
    const d = new Date(timestamp);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = (day - firstWeekDay + 7) % 7;
    d.setDate(d.getDate() - diff);
    return d.getTime();
}

function startOfMonth(timestamp: number, _timezone?: string): number {
    const d = new Date(timestamp);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

function startOfYear(timestamp: number, _timezone?: string): number {
    const d = new Date(timestamp);
    d.setMonth(0, 1);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

// ── RangeTimestamps factory ──

export function createRangeTimestamps(fromFn: (now: number) => number, toFn: (now: number) => number): RangeTimestamps {
    let _now = Date.now();
    let _timezone: string | undefined;
    let _from = fromFn(_now);
    let _to = toFn(_now);
    if (_from > _to) [_from, _to] = [_to, _from];

    return {
        get from() {
            return _from;
        },
        get to() {
            return _to;
        },
        get now() {
            return _now;
        },
        set now(timestamp: number) {
            _now = timestamp;
            _from = fromFn(_now);
            _to = toFn(_now);
            if (_from > _to) [_from, _to] = [_to, _from];
        },
        get timezone() {
            return _timezone;
        },
        set timezone(tz: string | undefined) {
            _timezone = tz;
        },
    };
}

// ── Preset factories ──

export function lastNDays(numberOfDays: number): RangeTimestamps {
    return createRangeTimestamps(
        now => {
            const d = new Date(startOfDay(now));
            d.setDate(d.getDate() - numberOfDays + 1);
            return d.getTime();
        },
        now => now
    );
}

export function thisWeek(): RangeTimestamps {
    return createRangeTimestamps(
        now => startOfWeek(now),
        now => now
    );
}

export function lastWeek(): RangeTimestamps {
    return createRangeTimestamps(
        now => {
            const weekStart = startOfWeek(now);
            const d = new Date(weekStart);
            d.setDate(d.getDate() - 7);
            return d.getTime();
        },
        now => {
            const weekStart = startOfWeek(now);
            const d = new Date(weekStart);
            d.setMilliseconds(d.getMilliseconds() - 1);
            return d.getTime();
        }
    );
}

export function thisMonth(): RangeTimestamps {
    return createRangeTimestamps(
        now => startOfMonth(now),
        now => now
    );
}

export function lastMonth(): RangeTimestamps {
    return createRangeTimestamps(
        now => {
            const monthStart = startOfMonth(now);
            const d = new Date(monthStart);
            d.setMonth(d.getMonth() - 1);
            return d.getTime();
        },
        now => {
            const monthStart = startOfMonth(now);
            const d = new Date(monthStart);
            d.setMilliseconds(d.getMilliseconds() - 1);
            return d.getTime();
        }
    );
}

export function yearToDate(): RangeTimestamps {
    return createRangeTimestamps(
        now => startOfYear(now),
        now => now
    );
}

// ── Utility: resolve from/to from a RangeTimestamps given a now + timezone ──

export function getDateRangeTimestamps(range: RangeTimestamps, now: number, _timezone?: string): { from: number; to: number } {
    const savedNow = range.now;
    const savedTz = range.timezone;
    try {
        range.now = now;
        range.timezone = _timezone;
        return { from: range.from, to: range.to };
    } finally {
        range.now = savedNow;
        range.timezone = savedTz;
    }
}

// ── Utility: create a static (fixed) range ──

export function createFixedRangeTimestamps(from: number, to: number): RangeTimestamps {
    return createRangeTimestamps(
        () => from,
        () => to
    );
}
