import { useCallback, useMemo, useState } from 'preact/hooks';
import useCoreContext from '@src/core/Context/useCoreContext';
import DateFilter from '@src/components/internal/FilterBar/filters/DateFilter';
import { DateFilterProps, DateRangeFilterParam } from '@src/components/internal/FilterBar/filters/DateFilter/types';
import { UsePaginatedRecords } from '@src/components/internal/Pagination/hooks/types';
import { useBalanceAccountSelection } from './BalanceAccountSelector';
import useDefaultTransactionsOverviewFilterParams from '../hooks/useDefaultTransactionsOverviewFilterParams';
import { TransactionFilterParam } from '../types';
import { EMPTY_OBJECT } from '@src/utils/common';

type TransactionsOverviewDateFilterProps = Pick<
    UsePaginatedRecords<any, string, TransactionFilterParam>,
    'canResetFilters' | 'filters' | 'updateFilters'
> &
    ReturnType<typeof useDefaultTransactionsOverviewFilterParams> & {
        balanceAccount?: ReturnType<typeof useBalanceAccountSelection>['activeBalanceAccount'];
    };

const TransactionsOverviewDateFilter = ({
    balanceAccount,
    canResetFilters,
    defaultParams,
    filters,
    nowTimestamp,
    refreshNowTimestamp,
    updateFilters,
}: TransactionsOverviewDateFilterProps) => {
    const { i18n } = useCoreContext();
    const defaultTimeRangePreset = useMemo(() => i18n.get(defaultParams.current.defaultTimeRange), [i18n]);
    const [selectedTimeRangePreset, setSelectedTimeRangePreset] = useState(defaultTimeRangePreset);

    const updateCreatedDateFilter = useCallback(
        (params: Parameters<DateFilterProps['onChange']>[0] = EMPTY_OBJECT) => {
            for (const [param, value] of Object.entries(params) as [keyof typeof params, (typeof params)[keyof typeof params]][]) {
                switch (param) {
                    case 'selectedPresetOption':
                        setSelectedTimeRangePreset(value || defaultTimeRangePreset);
                        break;
                    case DateRangeFilterParam.FROM:
                        updateFilters({
                            [TransactionFilterParam.CREATED_SINCE]:
                                value || defaultParams.current.defaultFilterParams[TransactionFilterParam.CREATED_SINCE],
                        });
                        break;
                    case DateRangeFilterParam.TO:
                        updateFilters({
                            [TransactionFilterParam.CREATED_UNTIL]:
                                value || defaultParams.current.defaultFilterParams[TransactionFilterParam.CREATED_UNTIL],
                        });
                        break;
                    default:
                        return;
                }

                refreshNowTimestamp();
            }
        },
        [defaultTimeRangePreset, refreshNowTimestamp, updateFilters]
    );

    useMemo(() => !canResetFilters && setSelectedTimeRangePreset(defaultTimeRangePreset), [canResetFilters, defaultTimeRangePreset]);

    return (
        <DateFilter
            label={i18n.get('dateRange')}
            name={TransactionFilterParam.CREATED_SINCE}
            untilDate={new Date(nowTimestamp).toString()}
            from={filters[TransactionFilterParam.CREATED_SINCE]}
            to={filters[TransactionFilterParam.CREATED_UNTIL]}
            selectedPresetOption={selectedTimeRangePreset}
            timeRangePresetOptions={defaultParams.current.timeRangeOptions}
            timezone={balanceAccount?.timeZone}
            onChange={updateCreatedDateFilter}
            showTimezoneInfo={true}
            now={nowTimestamp}
        />
    );
};

export default TransactionsOverviewDateFilter;
