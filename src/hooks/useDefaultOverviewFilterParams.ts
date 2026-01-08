import useBalanceAccountSelection from './useBalanceAccountSelection';
import { MutableRef, useCallback, useEffect, useRef, useState } from 'preact/hooks';
import {
    getTimeRangeSelectionDefaultPresetOptions,
    TIME_RANGE_SELECTION_PRESET_OPTION_KEYS,
    TimeRangeOptions,
    UseTimeRangeSelectionConfig,
} from '../components/internal/DatePicker/components/TimeRangeSelector';
import { DEFAULT_TRANSACTIONS_OVERVIEW_MULTI_SELECTION_FILTER_PARAMS } from '../components/external/TransactionsOverview/components/MultiSelectionFilter';
import { FilterParam } from '../components/types';

const getDefaultFilterParams = (
    type: 'transactions' | 'payouts' | 'reports' | 'disputes' | 'paymentLinks',
    timeRange?: TimeRangeOptions,
    timeRangeOptionsSubset?: Partial<UseTimeRangeSelectionConfig['options']>
) => {
    const timeRangeOptions = getTimeRangeSelectionDefaultPresetOptions();
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
    timeRangeOptionsSubset?: Partial<UseTimeRangeSelectionConfig['options']>
) => {
    const [nowTimestamp, setNowTimestamp] = useState(Date.now());
    const params = getDefaultFilterParams(filterType, timeRange, timeRangeOptionsSubset);
    const defaultParams: MutableRef<any> = useRef(params);
    const refreshNowTimestamp = useCallback(() => setNowTimestamp(Date.now()), [setNowTimestamp]);

    useEffect(() => {
        refreshNowTimestamp();
    }, [balanceAccount, refreshNowTimestamp]);

    return { defaultParams, nowTimestamp, refreshNowTimestamp } as const;
};

export default useDefaultOverviewFilterParams;
