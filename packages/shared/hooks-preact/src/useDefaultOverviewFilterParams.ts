import useBalanceAccountSelection from './useBalanceAccountSelection';
import { MutableRef, useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { TIME_RANGE_SELECTION_PRESET_OPTION_KEYS, type TimeRangeOptions, type UseTimeRangeSelectionConfig } from '@integration-components/types';
import { getTimeRangeSelectionDefaultPresetOptions as createDefaultTimeRangeSelectionOptions } from '@integration-components/utils/datetime/timeRangeSelection';
import { FilterParam } from '../../../../src/components/types';

type RangeTimestamps = { from: number; to: number; now?: number | Date | null; timezone?: unknown };

const getStartOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
const getEndOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();

const getOffsetDate = (date: Date, days: number) => {
    const offsetDate = new Date(date);
    offsetDate.setDate(offsetDate.getDate() + days);
    return offsetDate;
};

const getOffsetMonth = (date: Date, months: number) => {
    const offsetDate = new Date(date);
    offsetDate.setMonth(offsetDate.getMonth() + months);
    return offsetDate;
};

const createRange = (from: number, to: number): RangeTimestamps => ({ from, to }) as RangeTimestamps;

const getDefaultTimeRangeSelectionOptions = (): UseTimeRangeSelectionConfig<RangeTimestamps>['options'] => {
    const now = new Date();
    const dayOfWeek = now.getDay() || 7;
    const thisWeekStart = getOffsetDate(now, 1 - dayOfWeek);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = getOffsetMonth(thisMonthStart, -1);
    const lastMonthEnd = new Date(thisMonthStart.getTime() - 1);

    return createDefaultTimeRangeSelectionOptions<RangeTimestamps>({
        lastNDays: days => createRange(getStartOfDay(getOffsetDate(now, 1 - days)), now.getTime()),
        thisWeek: () => createRange(getStartOfDay(thisWeekStart), now.getTime()),
        lastWeek: () => createRange(getStartOfDay(getOffsetDate(thisWeekStart, -7)), getEndOfDay(getOffsetDate(thisWeekStart, -1))),
        thisMonth: () => createRange(getStartOfDay(thisMonthStart), now.getTime()),
        lastMonth: () => createRange(getStartOfDay(lastMonthStart), getEndOfDay(lastMonthEnd)),
        yearToDate: () => createRange(getStartOfDay(new Date(now.getFullYear(), 0, 1)), now.getTime()),
    });
};

// Default multi-selection filter parameters for the transactions overview.
// Inlined here to keep `type:shared` packages from depending on `type:domain` packages.
const DEFAULT_TRANSACTIONS_OVERVIEW_MULTI_SELECTION_FILTER_PARAMS = Object.freeze({
    [FilterParam.CURRENCIES]: '',
    [FilterParam.CATEGORIES]: '',
    [FilterParam.STATUSES]: '',
});

const getDefaultFilterParams = (
    type: 'transactions' | 'payouts' | 'reports' | 'disputes' | 'paymentLinks',
    timeRange?: TimeRangeOptions,
    timeRangeOptionsSubset?: Partial<UseTimeRangeSelectionConfig<RangeTimestamps>['options']>
) => {
    const timeRangeOptions = getDefaultTimeRangeSelectionOptions();
    const defaultTimeRange = timeRange
        ? (`common.filters.types.date.rangeSelect.options.${timeRange}` as const)
        : TIME_RANGE_SELECTION_PRESET_OPTION_KEYS.LAST_30_DAYS;

    const { from, to } = timeRangeOptions[defaultTimeRange]!;

    const defaultFilterParams = {
        ...(type === 'transactions' && {
            ...DEFAULT_TRANSACTIONS_OVERVIEW_MULTI_SELECTION_FILTER_PARAMS,
            [FilterParam.MIN_AMOUNT]: undefined,
            [FilterParam.MAX_AMOUNT]: undefined,
        }),
        ...(type !== 'paymentLinks' && {
            [FilterParam.BALANCE_ACCOUNT]: undefined,
        }),
        ...(type === 'paymentLinks' && {
            [FilterParam.MERCHANT_REFERENCE]: undefined,
            [FilterParam.PAYMENT_LINK_ID]: undefined,
            [FilterParam.MIN_AMOUNT]: undefined,
            [FilterParam.MAX_AMOUNT]: undefined,
        }),
        [FilterParam.CREATED_SINCE]: new Date(from).toISOString(),
        [FilterParam.CREATED_UNTIL]: new Date(to).toISOString(),
    } as const;

    return { defaultFilterParams, defaultTimeRange, timeRangeOptions: timeRangeOptionsSubset || timeRangeOptions } as const;
};

const useDefaultOverviewFilterParams = (
    filterType: Parameters<typeof getDefaultFilterParams>[0],
    balanceAccount?: ReturnType<typeof useBalanceAccountSelection>['activeBalanceAccount'],
    timeRange?: TimeRangeOptions,
    timeRangeOptionsSubset?: Partial<UseTimeRangeSelectionConfig<RangeTimestamps>['options']>
) => {
    const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());
    const params = getDefaultFilterParams(filterType, timeRange, timeRangeOptionsSubset);
    const defaultParams: MutableRef<any> = useRef(params);
    const refreshNowTimestamp = useCallback(() => setNowTimestamp(Date.now()), [setNowTimestamp]);

    useEffect(() => {
        refreshNowTimestamp();
    }, [balanceAccount, refreshNowTimestamp]);

    return { defaultParams, nowTimestamp, refreshNowTimestamp } as const;
};

export default useDefaultOverviewFilterParams;
