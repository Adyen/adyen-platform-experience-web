import { FilterEditModalRenderProps } from '../BaseFilter/types';
import { RangeFilterBody } from './types';
import InputBase from '@src/components/internal/FormFields/InputBase';
import './AmountFilter.scss';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { CommitAction } from '@src/hooks/useCommitAction';
import useCoreContext from '@src/core/Context/useCoreContext';
import { AMOUNT_CONSTANT } from './constants';

export const RangeSelection = ({
    onChange,
    editAction,
    onValueUpdated,
    selectedCurrencies,
    availableCurrencies,
    value,
    ...props
}: FilterEditModalRenderProps<RangeFilterBody>) => {
    const { i18n } = useCoreContext();

    const [minAmount, setMinAmount] = useState<number | undefined>(
        props.minAmount !== undefined ? parseFloat(props.minAmount) / AMOUNT_CONSTANT : undefined
    );
    const [maxAmount, setMaxAmount] = useState<number | undefined>(
        props.maxAmount !== undefined ? parseFloat(props.maxAmount) / AMOUNT_CONSTANT : undefined
    );

    const applyFilter = useCallback(() => {
        onChange({ minAmount, maxAmount });
    }, [maxAmount, minAmount, onChange]);

    const clearFilter = useCallback(() => {
        onChange({ minAmount: undefined, maxAmount: undefined });
        setMaxAmount(undefined);
        setMinAmount(undefined);
    }, [onChange]);

    useEffect(() => {
        if (editAction === CommitAction.APPLY) applyFilter();
        if (editAction === CommitAction.CLEAR) clearFilter();
    }, [applyFilter, clearFilter, editAction]);

    const filterValue = useMemo(() => ({ minAmount, maxAmount }), [maxAmount, minAmount]);

    useEffect(() => {
        if (filterValue.minAmount || filterValue.maxAmount) onValueUpdated(`${filterValue.minAmount}-${filterValue.maxAmount}`);
        else onValueUpdated(null);
    }, [filterValue, onValueUpdated]);

    return (
        <div className="adyen-fp-range-selection-filter">
            <div className="adyen-fp-range-selection-filter__input">
                <label htmlFor="minValue">{`${i18n.get('from')}:`}</label>
                <InputBase
                    lang={i18n.locale}
                    name={'minValue'}
                    type="number"
                    value={minAmount}
                    onInput={e => {
                        e.currentTarget && setMinAmount(e.currentTarget.value !== '' ? parseFloat(e.currentTarget.value) : undefined);
                    }}
                    min={0}
                    isInvalid={minAmount ? minAmount < 0 : false}
                    errorMessage={i18n.get('noNegativeNumbersAllowed')}
                />
            </div>
            <div className="adyen-fp-range-selection-filter__input">
                <label htmlFor="maxValue">{`${i18n.get('to')}:`}</label>
                <InputBase
                    lang={i18n.locale}
                    name={'maxValue'}
                    type="number"
                    value={maxAmount}
                    onInput={e => {
                        e.currentTarget && setMaxAmount(e.currentTarget.value !== '' ? parseFloat(e.currentTarget.value) : undefined);
                    }}
                    min={minAmount}
                    isInvalid={maxAmount !== undefined && minAmount !== undefined ? maxAmount < minAmount : false}
                    errorMessage={i18n.get('secondValueShouldBeGreaterThanTheFirstOne')}
                />
            </div>
        </div>
    );
};
