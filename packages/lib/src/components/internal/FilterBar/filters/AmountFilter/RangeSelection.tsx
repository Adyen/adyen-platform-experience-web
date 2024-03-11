import { FilterEditModalRenderProps } from '../BaseFilter/types';
import { RangeFilterBody } from './types';
import InputBase from '@src/components/internal/FormFields/InputBase';
import './AmountFilter.scss';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { CommitAction } from '@src/hooks/useCommitAction';
import useCoreContext from '@src/core/Context/useCoreContext';

export const RangeSelection = ({ onChange, editAction, onValueUpdated, ...props }: FilterEditModalRenderProps<RangeFilterBody>) => {
    const { i18n } = useCoreContext();
    const formatAmount = (amount: number) => {
        const formatter = new Intl.NumberFormat(i18n.locale);
        return formatter.format(amount);
    };
    const [minAmount, setMinAmount] = useState<number | undefined>(props.minAmount ? Number(props.minAmount) : undefined);
    const [maxAmount, setMaxAmount] = useState<number | undefined>(props.maxAmount ? Number(props.maxAmount) : undefined);

    const filterValue = useMemo(() => {
        if (minAmount !== undefined && minAmount < 0) return null;

        if (minAmount !== undefined && maxAmount !== undefined) {
            if (maxAmount < minAmount) return null;
            return `${formatAmount(minAmount)} - ${formatAmount(maxAmount)}`;
        }
        if (minAmount !== undefined) return `${i18n.get('from')} ${formatAmount(minAmount)}`;
        if (maxAmount !== undefined) return `${i18n.get('to')} ${formatAmount(maxAmount)}`;
    }, [i18n, maxAmount, minAmount]);

    const applyFilter = useCallback(
        () => onChange({ minAmount, maxAmount, filterValue: filterValue ?? undefined }),
        [filterValue, maxAmount, minAmount, onChange]
    );
    const clearFilter = useCallback(() => {
        onChange({ minAmount: undefined, maxAmount: undefined, filterValue: undefined });
        setMaxAmount(undefined);
        setMinAmount(undefined);
    }, [onChange]);

    useEffect(() => {
        if (editAction === CommitAction.APPLY) applyFilter();
        if (editAction === CommitAction.CLEAR) clearFilter();
    }, [applyFilter, clearFilter, editAction]);

    useEffect(() => {
        onValueUpdated(filterValue);
    }, [filterValue, onValueUpdated]);

    return (
        <div className="adyen-fp-range-selection-filter">
            <div className="adyen-fp-range-selection-filter__input">
                <label htmlFor="minValue">{`${i18n.get('from')}:`}</label>
                <InputBase
                    name={'minValue'}
                    type="number"
                    value={minAmount}
                    onInput={e => {
                        e.currentTarget && setMinAmount(Number(e.currentTarget.value));
                    }}
                    min={0}
                    isInvalid={minAmount ? minAmount < 0 : false}
                    errorMessage={i18n.get('noNegativeNumbersAllowed')}
                />
            </div>
            <div className="adyen-fp-range-selection-filter__input">
                <label htmlFor="maxValue">{`${i18n.get('to')}:`}</label>
                <InputBase
                    name={'maxValue'}
                    type="number"
                    value={maxAmount}
                    onInput={e => {
                        e.currentTarget && setMaxAmount(Number(e.currentTarget.value));
                    }}
                    min={minAmount}
                    isInvalid={maxAmount !== undefined && minAmount !== undefined ? maxAmount < minAmount : false}
                    errorMessage={i18n.get('secondValueShouldBeGreaterThanTheFirstOne')}
                />
            </div>
        </div>
    );
};
