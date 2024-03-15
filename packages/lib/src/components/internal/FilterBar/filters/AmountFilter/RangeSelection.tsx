import { FilterEditModalRenderProps } from '../BaseFilter/types';
import { RangeFilterBody } from './types';
import InputBase from '@src/components/internal/FormFields/InputBase';
import './AmountFilter.scss';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { CommitAction } from '@src/hooks/useCommitAction';
import useCoreContext from '@src/core/Context/useCoreContext';

export const RangeSelection = ({
    onChange,
    editAction,
    onValueUpdated,
    selectedCurrencies,
    availableCurrencies,
    ...props
}: FilterEditModalRenderProps<RangeFilterBody>) => {
    const { i18n } = useCoreContext();
    const showCurrencySymbol = useMemo(() => {
        if (selectedCurrencies?.length === 1 || availableCurrencies?.length === 1) return true;
        if ((availableCurrencies?.length ?? 0) > 1) return false;
        return false;
    }, [availableCurrencies?.length, selectedCurrencies?.length]);

    const formatAmount = useCallback(
        (amount: number, showSymbol: boolean) => {
            const formatter = new Intl.NumberFormat(i18n.locale);
            return showSymbol ? i18n.amount(amount, selectedCurrencies?.[0] || availableCurrencies?.[0] || 'EUR') : formatter.format(amount);
        },
        [availableCurrencies, i18n, selectedCurrencies]
    );
    const [minAmount, setMinAmount] = useState<number | undefined>(props.minAmount !== undefined ? parseFloat(props.minAmount) : undefined);
    const [maxAmount, setMaxAmount] = useState<number | undefined>(props.maxAmount !== undefined ? parseFloat(props.maxAmount) : undefined);

    const filterValue = useMemo(() => {
        if (minAmount !== undefined && minAmount < 0) return null;

        if (minAmount !== undefined && maxAmount !== undefined) {
            if (maxAmount < minAmount) return null;
            return `${formatAmount(minAmount, showCurrencySymbol)} to ${formatAmount(maxAmount, showCurrencySymbol)}`;
        }
        if (minAmount !== undefined) return `${i18n.get('from')} ${formatAmount(minAmount, showCurrencySymbol)}`;
        if (maxAmount !== undefined) return `${i18n.get('to')} ${formatAmount(maxAmount, showCurrencySymbol)}`;
    }, [formatAmount, i18n, maxAmount, minAmount, showCurrencySymbol]);

    const applyFilter = useCallback(() => {
        onChange({ minAmount, maxAmount, filterValue: filterValue !== undefined ? filterValue : undefined });
    }, [filterValue, maxAmount, minAmount, onChange]);
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
