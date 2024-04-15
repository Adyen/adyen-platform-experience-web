import { MutableRef, useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { getTimeRangeSelectionDefaultPresetOptions } from '@src/components/internal/DatePicker/components/TimeRangeSelector';
import { DEFAULT_TRANSACTIONS_OVERVIEW_MULTI_SELECTION_FILTER_PARAMS } from '../components/MultiSelectionFilter';
import { useBalanceAccountSelection } from '../components/BalanceAccountSelector';
import { TransactionFilterParam } from '../types';

const getDefaultTransactionsFilterParams = () => {
    const timeRangeOptions = getTimeRangeSelectionDefaultPresetOptions();
    const defaultTimeRange = 'rangePreset.last7Days';
    const { from, to } = timeRangeOptions[defaultTimeRange];

    const defaultFilterParams = {
        ...DEFAULT_TRANSACTIONS_OVERVIEW_MULTI_SELECTION_FILTER_PARAMS,
        [TransactionFilterParam.CREATED_SINCE]: new Date(from).toISOString(),
        [TransactionFilterParam.CREATED_UNTIL]: new Date(to).toISOString(),
        [TransactionFilterParam.MIN_AMOUNT]: undefined,
        [TransactionFilterParam.MAX_AMOUNT]: undefined,
    } as const;

    return { defaultFilterParams, defaultTimeRange, timeRangeOptions } as const;
};

const getDefaultPayoutsFilterParams = () => {
    const timeRangeOptions = getTimeRangeSelectionDefaultPresetOptions();
    const defaultTimeRange = 'rangePreset.last7Days';
    const { from, to } = timeRangeOptions[defaultTimeRange];

    const defaultFilterParams = {
        [TransactionFilterParam.CREATED_SINCE]: new Date(from).toISOString(),
        [TransactionFilterParam.CREATED_UNTIL]: new Date(to).toISOString(),
    } as const;

    return { defaultFilterParams, defaultTimeRange, timeRangeOptions } as const;
};

const useDefaultOverviewFilterParams = (
    balanceAccount?: ReturnType<typeof useBalanceAccountSelection>['activeBalanceAccount'],
    filterType?: 'transactions' | 'payouts'
) => {
    const [nowTimestamp, setNowTimestamp] = useState(Date.now());
    const params = filterType === 'payouts' ? getDefaultPayoutsFilterParams() : getDefaultTransactionsFilterParams();
    const defaultParams: MutableRef<any> = useRef(params);
    const refreshNowTimestamp = useCallback(() => setNowTimestamp(Date.now()), [setNowTimestamp]);

    useEffect(() => {
        refreshNowTimestamp();
    }, [balanceAccount, refreshNowTimestamp]);

    return { defaultParams, nowTimestamp, refreshNowTimestamp } as const;
};

export default useDefaultOverviewFilterParams;
