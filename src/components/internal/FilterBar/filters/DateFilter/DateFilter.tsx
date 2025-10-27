import { UseTimeRangeSelectionConfig } from '../../../DatePicker/components/TimeRangeSelector';
import DateFilterCore from './DateFilterCore';
import useDefaultOverviewFilterParams from '../../../../../hooks/useDefaultOverviewFilterParams';
import { FilterParam } from '../../../../types';
import { useCallback, useMemo, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { DateFilterProps, DateRangeFilterParam } from './types';
import { UsePaginatedRecords } from '../../../Pagination/hooks/types';
import { EMPTY_OBJECT } from '../../../../../utils';

type DataOverviewDateFilterProps = Pick<UsePaginatedRecords<any, string, FilterParam>, 'canResetFilters' | 'filters' | 'updateFilters'> &
    ReturnType<typeof useDefaultOverviewFilterParams> & {
        timezone?: UseTimeRangeSelectionConfig['timezone'];
        onResetAction?: () => void;
    };

const DateFilter = <T extends DateFilterProps = DateFilterProps>({
    timezone,
    canResetFilters,
    defaultParams,
    filters,
    nowTimestamp,
    refreshNowTimestamp,
    sinceDate,
    untilDate,
    updateFilters,
}: Pick<T, 'sinceDate' | 'untilDate'> & DataOverviewDateFilterProps) => {
    const { i18n } = useCoreContext();
    const label = useMemo(() => i18n.get('common.filters.types.date.label'), [i18n]);
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
                            [FilterParam.CREATED_SINCE]: value || defaultParams.current.defaultFilterParams[FilterParam.CREATED_SINCE],
                        });
                        break;
                    case DateRangeFilterParam.TO:
                        updateFilters({
                            [FilterParam.CREATED_UNTIL]: value || defaultParams.current.defaultFilterParams[FilterParam.CREATED_UNTIL],
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
        <DateFilterCore
            label={label}
            aria-label={label}
            name={FilterParam.CREATED_SINCE}
            sinceDate={sinceDate}
            untilDate={untilDate ?? new Date(nowTimestamp).toString()}
            from={filters[FilterParam.CREATED_SINCE]}
            to={filters[FilterParam.CREATED_UNTIL]}
            selectedPresetOption={selectedTimeRangePreset}
            timeRangePresetOptions={defaultParams.current.timeRangeOptions}
            timezone={timezone}
            onChange={updateCreatedDateFilter}
            showTimezoneInfo={true}
            now={nowTimestamp}
        />
    );
};

export default DateFilter;
