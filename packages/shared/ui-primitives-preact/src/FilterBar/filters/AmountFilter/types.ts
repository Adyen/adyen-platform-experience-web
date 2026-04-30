import { FilterParam } from '@integration-components/types';
import { BaseFilterProps } from '../BaseFilter/types';
import { ReactiveStateRecord } from '@integration-components/hooks-preact/useReactiveState/types';

type RangeOptions = 'minAmount' | 'maxAmount';
export interface RangeFilterProps extends BaseFilterProps {
    updateFilters: (stateUpdateRequest: Partial<ReactiveStateRecord<string, FilterParam>>) => void;
    minAmount?: string;
    maxAmount?: string;
    currencies?: string[];
}

export interface RangeFilterBody extends RangeFilterProps {
    onChange: (params: { [K in RangeOptions]: number | undefined }) => void;
}
