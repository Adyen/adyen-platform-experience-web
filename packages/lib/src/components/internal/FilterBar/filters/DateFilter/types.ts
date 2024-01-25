import { UseTimeRangeSelectionConfig } from '@src/components/internal/DatePicker/components/TimeRangeSelector';
import { BaseFilterProps } from '../BaseFilter/types';

export const enum DateRangeFilterParam {
    FROM = 'from',
    TO = 'to',
}

export interface DateFilterProps extends BaseFilterProps {
    onChange: (params?: { [P in DateRangeFilterParam | 'selectedPresetOption']?: string }) => void;
    sinceDate?: string;
    untilDate?: string;
    selectedPresetOption?: string;
    timeRangePresetOptions?: UseTimeRangeSelectionConfig['options'];
    [DateRangeFilterParam.FROM]?: string;
    [DateRangeFilterParam.TO]?: string;
}
