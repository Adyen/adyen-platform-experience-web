import { expect, test } from 'vitest';
import { getTimezoneAwareDateRangeQueryParams, useDateRangeFilterState } from './useDateRangeFilterState';
import { endOfDay } from '@integration-components/utils';

test('normalizes date ranges without mutating the default range and caps query boundaries', () => {
    const defaultValue = {
        startDate: new Date('2024-01-01T00:00:00.000Z'),
        endDate: new Date('2024-01-31T23:59:59.999Z'),
        range: 'last30Days',
    };

    const dateRange = useDateRangeFilterState({
        defaultValue,
        earliestDate: new Date('2024-01-10T00:00:00.000Z'),
        quickSelectRanges: [],
        getCurrentTimestamp: () => new Date('2024-01-20T12:00:00.000Z').getTime(),
    });

    dateRange.selectedDateRange.value.startDate.setUTCDate(5);

    expect(defaultValue.startDate.toISOString()).toBe('2024-01-01T00:00:00.000Z');

    dateRange.selectedDateRange.value = dateRange.normalizeDateRange({
        startDate: new Date('2024-01-01T14:15:00.000Z'),
        endDate: new Date('2024-01-31T08:30:00.000Z'),
    });

    expect(dateRange.getDateRangeQueryParams()).toEqual({
        createdSince: '2024-01-10T00:00:00.000Z',
        createdUntil: '2024-01-20T12:00:00.000Z',
    });
});

test('resets an invalid date range to a cloned default range', () => {
    const dateRange = useDateRangeFilterState({
        defaultValue: {
            startDate: new Date('2024-01-01T00:00:00.000Z'),
            endDate: new Date('2024-01-31T23:59:59.999Z'),
        },
        earliestDate: new Date('2024-01-01T00:00:00.000Z'),
    });

    const normalized = dateRange.normalizeDateRange({
        startDate: new Date('invalid'),
        endDate: new Date('2024-01-31T23:59:59.999Z'),
    });

    expect(normalized).toEqual(dateRange.defaultDateRange);
    expect(normalized).not.toBe(dateRange.defaultDateRange);
});

test('creates query parameters at the selected timezone boundaries', () => {
    expect(
        getTimezoneAwareDateRangeQueryParams({
            dateRange: {
                startDate: new Date(2024, 0, 15),
                endDate: new Date(2024, 0, 15, 23, 59, 59, 999),
            },
            earliestDate: new Date(2024, 0, 1),
            timezone: 'America/New_York',
        })
    ).toEqual({
        createdSince: '2024-01-15T05:00:00.000Z',
        createdUntil: '2024-01-16T04:59:59.999Z',
    });
});

test('uses the selected timezone daylight-saving offset for query parameters', () => {
    const dateRange = useDateRangeFilterState({
        defaultValue: {
            startDate: new Date(2024, 6, 1),
            endDate: new Date(2024, 6, 31, 23, 59, 59, 999),
        },
        initialValue: {
            startDate: new Date(2024, 6, 15),
            endDate: new Date(2024, 6, 15, 23, 59, 59, 999),
        },
        earliestDate: new Date(2024, 6, 1),
        timezone: 'America/New_York',
    });

    expect(dateRange.getDateRangeQueryParams()).toEqual({
        createdSince: '2024-07-15T04:00:00.000Z',
        createdUntil: '2024-07-16T03:59:59.999Z',
    });
});

test('uses a cloned initial range and disables dates outside the available bounds', () => {
    const initialValue = {
        startDate: new Date('2024-01-15T08:00:00.000Z'),
        endDate: new Date('2024-01-20T12:00:00.000Z'),
    };

    const dateRange = useDateRangeFilterState({
        defaultValue: {
            startDate: new Date('2024-01-01T00:00:00.000Z'),
            endDate: new Date('2024-01-31T23:59:59.999Z'),
        },
        initialValue,
        earliestDate: new Date('2024-01-10T00:00:00.000Z'),
        getCurrentTimestamp: () => new Date('2024-01-20T12:00:00.000Z').getTime(),
    });

    expect(dateRange.selectedDateRange.value).toEqual(initialValue);
    expect(dateRange.selectedDateRange.value).not.toBe(initialValue);

    expect(dateRange.isDateDisabled(new Date('2024-01-09T00:00:00.000Z'))).toBe(true);
    expect(dateRange.isDateDisabled(new Date('2024-01-20T00:00:00.000Z'))).toBe(false);
    expect(dateRange.isDateDisabled(new Date('2024-01-21T00:00:00.000Z'))).toBe(true);
    expect(dateRange.maximumDate).toEqual(endOfDay(new Date('2024-01-20T12:00:00.000Z')));

    expect(dateRange.getDateRangeFilterOptions({ quickSelectRanges: [], disableUnavailableDates: true })).toEqual({
        min: new Date('2024-01-10T00:00:00.000Z'),
        max: dateRange.maximumDate,
        quickSelectRanges: [],
        isDateDisabled: dateRange.isDateDisabled,
    });
});
