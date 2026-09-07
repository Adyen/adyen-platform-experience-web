import { ref, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import type { BentoDateRangePickerValue } from '@adyen/bento-vue3';
import { endOfDay, quickSelectDateRanges, startOfDay } from '@integration-components/utils';
import createRestamper, { systemToTimezone } from '@integration-components/utils/datetime/restamper';

export interface DateRangeQueryParams {
    createdSince: string;
    createdUntil: string;
}

interface UseDateRangeFilterStateOptions {
    defaultValue: BentoDateRangePickerValue;
    initialValue?: BentoDateRangePickerValue;
    earliestDate: Date;
    quickSelectRanges?: readonly BentoDateRangePickerValue[];
    getCurrentTimestamp?: () => number;
    timezone?: MaybeRefOrGetter<string | undefined>;
}

export interface GetDateRangeQueryParamsOptions {
    dateRange: BentoDateRangePickerValue;
    earliestDate: Date;
    getCurrentTimestamp?: () => number;
    timezone?: string;
}

export function cloneDateRange(value: BentoDateRangePickerValue): BentoDateRangePickerValue {
    return {
        startDate: new Date(value.startDate),
        endDate: new Date(value.endDate),
        ...(value.granularity ? { granularity: value.granularity } : {}),
        ...(value.range ? { range: value.range } : {}),
    };
}

export function getTimezoneAwareDateRangeQueryParams({
    dateRange,
    earliestDate,
    getCurrentTimestamp = Date.now,
    timezone,
}: GetDateRangeQueryParamsOptions): DateRangeQueryParams {
    const restamper = createRestamper();
    restamper.tz = timezone;

    const toQueryTimestamp = (date: Date) => (timezone ? systemToTimezone(restamper, date) : date.getTime());
    const createdSince = Math.max(toQueryTimestamp(startOfDay(dateRange.startDate)), toQueryTimestamp(earliestDate));
    const createdUntil = Math.min(toQueryTimestamp(endOfDay(dateRange.endDate)), getCurrentTimestamp());

    return {
        createdSince: new Date(createdSince).toISOString(),
        createdUntil: new Date(createdUntil).toISOString(),
    };
}

export function useDateRangeFilterState({
    defaultValue,
    initialValue,
    earliestDate,
    quickSelectRanges = Object.values(quickSelectDateRanges),
    getCurrentTimestamp = () => Date.now(),
    timezone,
}: UseDateRangeFilterStateOptions) {
    const defaultDateRange = cloneDateRange(defaultValue);
    const maximumDate = endOfDay(new Date(getCurrentTimestamp()));
    const selectedDateRange = ref<BentoDateRangePickerValue>(cloneDateRange(initialValue ?? defaultDateRange));

    const normalizeDateRange = (value: BentoDateRangePickerValue | undefined): BentoDateRangePickerValue => {
        if (!value?.startDate || !value?.endDate || Number.isNaN(value.startDate.getTime()) || Number.isNaN(value.endDate.getTime())) {
            return cloneDateRange(defaultDateRange);
        }

        const normalizedRange = {
            startDate: startOfDay(value.startDate),
            endDate: endOfDay(value.endDate),
            ...(value.granularity ? { granularity: value.granularity } : {}),
            ...(value.range ? { range: value.range } : {}),
        } satisfies BentoDateRangePickerValue;

        const matchingQuickSelectRange = quickSelectRanges.find(
            range =>
                range.startDate.getTime() === normalizedRange.startDate.getTime() && range.endDate.getTime() === normalizedRange.endDate.getTime()
        );

        return cloneDateRange(matchingQuickSelectRange ?? normalizedRange);
    };

    const resetDateRange = () => {
        selectedDateRange.value = cloneDateRange(defaultDateRange);
    };

    const isDateDisabled = (date: Date) => {
        return date.getTime() < earliestDate.getTime() || date.getTime() > endOfDay(new Date(getCurrentTimestamp())).getTime();
    };

    const getDateRangeFilterOptions = <T>(options: { quickSelectRanges: T; disableUnavailableDates?: boolean }) => ({
        min: earliestDate,
        max: maximumDate,
        quickSelectRanges: options.quickSelectRanges,
        ...(options.disableUnavailableDates ? { isDateDisabled } : {}),
    });

    const getDateRangeQueryParams = () => {
        return getTimezoneAwareDateRangeQueryParams({
            dateRange: selectedDateRange.value,
            earliestDate,
            getCurrentTimestamp,
            timezone: toValue(timezone),
        });
    };

    return {
        defaultDateRange,
        maximumDate,
        selectedDateRange,
        normalizeDateRange,
        resetDateRange,
        isDateDisabled,
        getDateRangeFilterOptions,
        getDateRangeQueryParams,
    } as const;
}

export default useDateRangeFilterState;
