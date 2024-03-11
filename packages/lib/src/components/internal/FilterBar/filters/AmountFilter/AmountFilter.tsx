import BaseFilter from '../BaseFilter';
import { FilterProps } from '../BaseFilter/types';
import { RangeFilterProps } from './types';
import { RangeSelection } from './RangeSelection';
import { useCallback, useState } from 'preact/hooks';
import { EMPTY_OBJECT } from '@src/utils/common';

const AMOUNT_CONSTANT = 100000;

export const AmountFilter = ({ updateFilters, ...props }: FilterProps<RangeFilterProps>) => {
    const [value, setValue] = useState<string>();

    const onFilterChange = useCallback(
        (params: { minAmount: number | undefined; maxAmount: number | undefined; filterValue: string | undefined }) => {
            setValue(params.filterValue);
            setValue(params.filterValue);
            const { minAmount, maxAmount } = params ?? EMPTY_OBJECT;
            updateFilters({
                minAmount: minAmount !== undefined ? String(minAmount * AMOUNT_CONSTANT) : undefined,
                maxAmount: maxAmount !== undefined ? String(maxAmount * AMOUNT_CONSTANT) : undefined,
            });
        },
        [updateFilters]
    );

    return (
        <BaseFilter<RangeFilterProps>
            {...props}
            updateFilters={updateFilters}
            minAmount={props.minAmount}
            maxAmount={props.maxAmount}
            onChange={onFilterChange}
            value={value}
            label={value ?? props.label}
            type={'text'}
            render={RangeSelection}
        />
    );
};
