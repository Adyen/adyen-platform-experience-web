import { BaseFilterProps } from '../BaseFilter/types';
import { ReactiveStateRecord } from '@src/hooks/useReactiveState/types';
import { TransactionFilterParam } from '@src/components';

type RangeOptions = 'minAmount' | 'maxAmount';
export interface RangeFilterProps extends BaseFilterProps {
    updateFilters: (stateUpdateRequest: Partial<ReactiveStateRecord<string, TransactionFilterParam>>) => void;
    minAmount?: string;
    maxAmount?: string;
    currencies?: string[];
}

export interface RangeFilterBody extends RangeFilterProps {
    onChange: (params: { [K in RangeOptions]: number | undefined } & { filterValue: string | undefined | null }) => void;
}
