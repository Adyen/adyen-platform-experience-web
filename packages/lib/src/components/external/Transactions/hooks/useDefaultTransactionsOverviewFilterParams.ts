import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
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
    } as const;

    return { defaultFilterParams, defaultTimeRange, timeRangeOptions } as const;
};

const useDefaultTransactionsOverviewFilterParams = (balanceAccount?: ReturnType<typeof useBalanceAccountSelection>['activeBalanceAccount']) => {
    const [nowTimestamp, setNowTimestamp] = useState(Date.now());
    const defaultParams = useMemo(getDefaultTransactionsFilterParams, [balanceAccount]);
    const refreshNowTimestamp = useCallback(() => setNowTimestamp(Date.now()), [setNowTimestamp]);

    useEffect(() => {
        refreshNowTimestamp();
    }, [balanceAccount, refreshNowTimestamp]);

    return { ...defaultParams, nowTimestamp, refreshNowTimestamp } as const;
};

export default useDefaultTransactionsOverviewFilterParams;
