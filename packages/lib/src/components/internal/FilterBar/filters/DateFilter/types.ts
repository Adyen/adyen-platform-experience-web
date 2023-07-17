import { BaseFilterProps } from '../BaseFilter/types';

export const enum DateRangeFilterParam {
    FROM = 'from',
    TO = 'to',
}

export interface DateFilterProps extends BaseFilterProps {
    onChange: (params?: { [P in DateRangeFilterParam]?: string }) => void;
    rangeEnd?: string;
    rangeStart?: string;
    [DateRangeFilterParam.FROM]?: string;
    [DateRangeFilterParam.TO]?: string;
}
