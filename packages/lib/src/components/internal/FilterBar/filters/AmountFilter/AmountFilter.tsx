import BaseFilter from '../BaseFilter';
import { FilterProps } from '../BaseFilter/types';
import { RangeFilterProps } from './types';
import { RangeSelection } from './RangeSelection';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { EMPTY_OBJECT } from '@src/utils/common';
import { PopoverContainerSize } from '@src/components/internal/Popover/types';
import useCoreContext from '@src/core/Context/useCoreContext';
import { AMOUNT_MULTIPLIER } from './constants';

export const AmountFilter = ({ updateFilters, selectedCurrencies, availableCurrencies, ...props }: FilterProps<RangeFilterProps>) => {
    const { i18n } = useCoreContext();
    const [value, setValue] = useState<{ minAmount: number | undefined; maxAmount: number | undefined } | undefined>();
    const [formattedValue, setValueFormattedValue] = useState<string | undefined>();

    const showCurrencySymbol = useMemo(() => {
        if (selectedCurrencies?.length === 1 || availableCurrencies?.length === 1) return true;
        return false;
    }, [availableCurrencies?.length, selectedCurrencies?.length]);

    const formatAmount = useCallback(
        (amount: number, showSymbol: boolean) => {
            const currencyCode = selectedCurrencies?.[0] || availableCurrencies?.[0];
            const formatter = new Intl.NumberFormat(i18n.locale);

            if (!currencyCode) return formatter.format(amount);

            return showSymbol
                ? amount.toLocaleString(currencyCode, {
                      style: 'currency',
                      currency: currencyCode,
                      currencyDisplay: 'symbol',
                  })
                : formatter.format(amount);
        },
        [availableCurrencies, i18n, selectedCurrencies]
    );

    const onFilterChange = useCallback(
        (params: { minAmount: number | undefined; maxAmount: number | undefined; filterValue: string | undefined }) => {
            const { minAmount, maxAmount } = params ?? EMPTY_OBJECT;
            setValue({ minAmount, maxAmount });

            updateFilters({
                minAmount: minAmount !== undefined ? String(minAmount * AMOUNT_MULTIPLIER) : undefined,
                maxAmount: maxAmount !== undefined ? String(maxAmount * AMOUNT_MULTIPLIER) : undefined,
            });
        },
        [updateFilters]
    );

    if (value && (value.minAmount || value.maxAmount)) {
        const { minAmount, maxAmount } = value;

        if (minAmount !== undefined && minAmount < 0) setValueFormattedValue(undefined);

        if (minAmount !== undefined && maxAmount !== undefined) {
            if (maxAmount < minAmount) setValueFormattedValue(undefined);
            setValueFormattedValue(`${formatAmount(minAmount, showCurrencySymbol)} to ${formatAmount(maxAmount, showCurrencySymbol)}`);
        } else {
            if (minAmount !== undefined) setValueFormattedValue(`${i18n.get('from')} ${formatAmount(minAmount, showCurrencySymbol)}`);
            if (maxAmount !== undefined) setValueFormattedValue(`${i18n.get('to')} ${formatAmount(maxAmount, showCurrencySymbol)}`);
        }
    } else {
        setValueFormattedValue(undefined);
    }

    return (
        <BaseFilter<RangeFilterProps>
            {...props}
            updateFilters={updateFilters}
            minAmount={props.minAmount}
            maxAmount={props.maxAmount}
            onChange={onFilterChange}
            value={formattedValue}
            label={formattedValue ? formattedValue : props.label}
            type={'text'}
            containerSize={PopoverContainerSize.MEDIUM}
            selectedCurrencies={selectedCurrencies}
            availableCurrencies={availableCurrencies}
            render={RangeSelection}
        />
    );
};
