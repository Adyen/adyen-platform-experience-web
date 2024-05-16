import BaseFilter from '../BaseFilter';
import { FilterProps } from '../BaseFilter/types';
import { RangeFilterProps } from './types';
import { RangeSelection } from './RangeSelection';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { EMPTY_OBJECT, isUndefined } from '../../../../../primitives/utils';
import { PopoverContainerSize } from '../../../Popover/types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { AMOUNT_MULTIPLIER } from './constants';

export const AmountFilter = ({ updateFilters, selectedCurrencies, availableCurrencies, ...props }: FilterProps<RangeFilterProps>) => {
    const { i18n } = useCoreContext();
    const [value, setValue] = useState<{ minAmount: number | undefined; maxAmount: number | undefined } | undefined>();
    const [formattedValue, setValueFormattedValue] = useState<string | undefined>();

    const showCurrencySymbol = useMemo(() => {
        return selectedCurrencies?.length === 1 || availableCurrencies?.length === 1;
    }, [availableCurrencies?.length, selectedCurrencies?.length]);

    const formatAmount = useCallback(
        (amount: number, showSymbol: boolean) => {
            const currencyCode = selectedCurrencies?.[0] || availableCurrencies?.[0];
            const options =
                showSymbol && currencyCode
                    ? {
                          style: 'currency',
                          currency: currencyCode,
                          currencyDisplay: 'symbol',
                      }
                    : undefined;
            return amount.toLocaleString(i18n.locale, options);
        },
        [availableCurrencies, i18n, selectedCurrencies]
    );

    const onFilterChange = useCallback(
        (params: { minAmount: number | undefined; maxAmount: number | undefined; filterValue: string | undefined }) => {
            const { minAmount, maxAmount } = params ?? EMPTY_OBJECT;
            setValue({ minAmount, maxAmount });
            if (isUndefined(minAmount) && isUndefined(maxAmount)) setValueFormattedValue(undefined);
            updateFilters({
                minAmount: !isUndefined(minAmount) ? String(minAmount * AMOUNT_MULTIPLIER) : undefined,
                maxAmount: !isUndefined(maxAmount) ? String(maxAmount * AMOUNT_MULTIPLIER) : undefined,
            });
        },
        [updateFilters]
    );

    if (value && (value.minAmount || value.maxAmount)) {
        const { minAmount, maxAmount } = value ?? {};
        if (!isUndefined(minAmount) && !isUndefined(maxAmount) && minAmount <= maxAmount) {
            setValueFormattedValue(
                `${formatAmount(minAmount, showCurrencySymbol)} ${i18n.get('to').toLowerCase()} ${formatAmount(maxAmount, showCurrencySymbol)}`
            );
        } else if (!isUndefined(minAmount) && isUndefined(maxAmount) && minAmount >= 0) {
            setValueFormattedValue(`${i18n.get('from')} ${formatAmount(minAmount, showCurrencySymbol)}`);
        } else if (isUndefined(minAmount) && !isUndefined(maxAmount)) {
            setValueFormattedValue(`${i18n.get('to')} ${formatAmount(maxAmount, showCurrencySymbol)}`);
        } else {
            setValueFormattedValue(undefined);
        }
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
