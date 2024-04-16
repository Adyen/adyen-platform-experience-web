import { TransactionFilterParam } from '@src/components';
import { useBalanceAccountSelection } from '@src/components/shared/components/BalanceAccountSelector';
import useDefaultOverviewFilterParams from '@src/components/shared/hooks/useDefaultOverviewFilterParams';
import { DateFilterParam } from '@src/components/shared/components/types';
import { useCallback, useMemo, useState } from 'preact/hooks';
import useCoreContext from '@src/core/Context/useCoreContext';
import DateFilter from '@src/components/internal/FilterBar/filters/DateFilter';
import { DateFilterProps, DateRangeFilterParam } from '@src/components/internal/FilterBar/filters/DateFilter/types';
import { UsePaginatedRecords } from '@src/components/internal/Pagination/hooks/types';
import { EMPTY_OBJECT } from '@src/utils/common';

type DataOverviewDateFilterProps = Pick<UsePaginatedRecords<any, string, DateFilterParam>, 'canResetFilters' | 'filters' | 'updateFilters'> &
    ReturnType<typeof useDefaultOverviewFilterParams> & {
        balanceAccount?: ReturnType<typeof useBalanceAccountSelection>['activeBalanceAccount'];
    };

const DataOverviewDateFilter = ({
    balanceAccount,
    canResetFilters,
    defaultParams,
    filters,
    nowTimestamp,
    refreshNowTimestamp,
    updateFilters,
}: DataOverviewDateFilterProps) => {
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
                            [DateFilterParam.CREATED_SINCE]: value || defaultParams.current.defaultFilterParams[TransactionFilterParam.CREATED_SINCE],
                        });
                        break;
                    case DateRangeFilterParam.TO:
                        updateFilters({
                            [DateFilterParam.CREATED_UNTIL]: value || defaultParams.current.defaultFilterParams[DateFilterParam.CREATED_UNTIL],
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

    const sinceDate = useMemo(() => {
        const date = new Date(nowTimestamp);
        date.setMonth(date.getMonth() - 24);
        return date.toString();
    }, [nowTimestamp]);

    return (
        <DateFilter
            label={i18n.get('dateRange')}
            name={TransactionFilterParam.CREATED_SINCE}
            sinceDate={sinceDate}
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

export default DataOverviewDateFilter;
