import { BaseFilterProps } from '../BaseFilter/types';
import { ReactiveStateRecord } from '../../../../../hooks/useReactiveState/types';
import { TransactionFilterParam } from '../../../../external';

type RangeOptions = 'minAmount' | 'maxAmount';
export interface RangeFilterProps extends BaseFilterProps {
    updateFilters: (stateUpdateRequest: Partial<ReactiveStateRecord<string, TransactionFilterParam>>) => void;
    minAmount?: string;
    maxAmount?: string;
    currencies?: string[];
}

export interface RangeFilterBody extends RangeFilterProps {
    onChange: (params: { [K in RangeOptions]: number | undefined }) => void;
}
