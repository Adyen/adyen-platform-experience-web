import useBalanceAccountSelection from './useBalanceAccountSelection';
import { FilterParam } from '../../types';
import { MutableRef, useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { getTimeRangeSelectionDefaultPresetOptions } from '../internal/DatePicker/components/TimeRangeSelector';
import { DEFAULT_TRANSACTIONS_OVERVIEW_MULTI_SELECTION_FILTER_PARAMS } from '../external/TransactionsOverview/components/MultiSelectionFilter';

const getDefaultFilterParams = (type: 'transactions' | 'payouts') => {
    const timeRangeOptions = getTimeRangeSelectionDefaultPresetOptions();
    const defaultTimeRange = 'rangePreset.last30Days';
    const { from, to } = timeRangeOptions[defaultTimeRange];

    const defaultFilterParams = {
        ...(type === 'transactions' && {
            ...DEFAULT_TRANSACTIONS_OVERVIEW_MULTI_SELECTION_FILTER_PARAMS,
            [FilterParam.MIN_AMOUNT]: undefined,
            [FilterParam.MAX_AMOUNT]: undefined,
        }),
        [FilterParam.CREATED_SINCE]: new Date(from).toISOString(),
        [FilterParam.CREATED_UNTIL]: new Date(to).toISOString(),
    } as const;

    return { defaultFilterParams, defaultTimeRange, timeRangeOptions } as const;
};

const useDefaultOverviewFilterParams = (
    filterType: Parameters<typeof getDefaultFilterParams>[0],
    balanceAccount?: ReturnType<typeof useBalanceAccountSelection>['activeBalanceAccount']
) => {
    const [nowTimestamp, setNowTimestamp] = useState(Date.now());
    const params = getDefaultFilterParams(filterType);
    const defaultParams: MutableRef<any> = useRef(params);
    const refreshNowTimestamp = useCallback(() => setNowTimestamp(Date.now()), [setNowTimestamp]);

    useEffect(() => {
        refreshNowTimestamp();
    }, [balanceAccount, refreshNowTimestamp]);

    return { defaultParams, nowTimestamp, refreshNowTimestamp } as const;
};

export default useDefaultOverviewFilterParams;
