import { UseTimeRangeSelectionConfig } from '../../../DatePicker/components/TimeRangeSelector';
import { BaseFilterProps } from '../BaseFilter/types';

export const enum DateRangeFilterParam {
    FROM = 'from',
    TO = 'to',
}

export interface DateFilterProps extends BaseFilterProps {
    onChange: (params?: { [P in DateRangeFilterParam | 'selectedPresetOption']?: string }) => void;
    sinceDate?: string;
    untilDate?: string;
    now?: UseTimeRangeSelectionConfig['now'];
    selectedPresetOption?: string;
    showTimezoneInfo?: boolean;
    timeRangePresetOptions: UseTimeRangeSelectionConfig['options'];
    timeRangeSelectorLabel?: string;
    timezone?: UseTimeRangeSelectionConfig['timezone'];
    [DateRangeFilterParam.FROM]?: string;
    [DateRangeFilterParam.TO]?: string;
}
