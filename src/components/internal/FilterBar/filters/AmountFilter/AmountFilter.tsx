import BaseFilter from '../BaseFilter';
import { FilterEditModalRenderProps, FilterProps } from '../BaseFilter/types';
import { RangeFilterBody, RangeFilterProps } from './types';
import { RangeSelection } from './RangeSelection';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { EMPTY_OBJECT, isUndefined } from '../../../../../utils';
import { PopoverContainerSize } from '../../../Popover/types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { AMOUNT_MULTIPLIER } from './constants';

const enum AmountFormat {
    ALL = 0,
    BETWEEN,
    EXACT,
    MAX,
    MIN,
}

const determineAmountFormat = (minAmount: number | undefined, maxAmount: number | undefined): AmountFormat => {
    if (!isUndefined(maxAmount) && maxAmount >= 0) {
        if (!isUndefined(minAmount) && minAmount > maxAmount) {
            return AmountFormat.ALL;
        } else if (minAmount === maxAmount || maxAmount === 0) {
            return AmountFormat.EXACT;
        } else if (minAmount && minAmount > 0) {
            return AmountFormat.BETWEEN;
        } else {
            return AmountFormat.MAX;
        }
    } else if (isUndefined(maxAmount) && minAmount && minAmount > 0) {
        return AmountFormat.MIN;
    }
    return AmountFormat.ALL;
};

const renderAmountFilter = (props: FilterEditModalRenderProps<RangeFilterBody>) => <RangeSelection {...props} />;

export const AmountFilter = ({ updateFilters, selectedCurrencies, availableCurrencies, ...props }: FilterProps<RangeFilterProps>) => {
    const { i18n } = useCoreContext();
    const [formattedValue, setFormattedValue] = useState<string | undefined>();
    const [value, setValue] = useState<{ minAmount: number | undefined; maxAmount: number | undefined }>();

    const formatAmount = useMemo(() => {
        const currency = selectedCurrencies?.[0] || availableCurrencies?.[0];
        const showCurrencySymbol = availableCurrencies?.length === 1 || selectedCurrencies?.length === 1;

        const formatOptions: Intl.NumberFormatOptions | undefined =
            showCurrencySymbol && currency ? { currency, currencyDisplay: 'symbol', style: 'currency' } : undefined;

        return (amount: number) => amount.toLocaleString(i18n.locale, formatOptions);
    }, [i18n, availableCurrencies, selectedCurrencies]);

    const onChange = useCallback(
        (params?: { minAmount: number | undefined; maxAmount: number | undefined }) => {
            let { minAmount, maxAmount } = params ?? (EMPTY_OBJECT as NonNullable<typeof params>);

            minAmount = isUndefined(minAmount) ? minAmount : Number(minAmount);
            maxAmount = isUndefined(maxAmount) ? maxAmount : Number(maxAmount);
            setValue({ minAmount, maxAmount });

            if (isUndefined(minAmount) && isUndefined(maxAmount)) setFormattedValue(undefined);

            updateFilters({
                minAmount: isUndefined(minAmount) ? minAmount : String(Math.round(minAmount * AMOUNT_MULTIPLIER)),
                maxAmount: isUndefined(maxAmount) ? maxAmount : String(Math.round(maxAmount * AMOUNT_MULTIPLIER)),
            });
        },
        [updateFilters]
    );

    useEffect(() => {
        const { minAmount, maxAmount } = value ?? {};
        const amountFormat = determineAmountFormat(minAmount, maxAmount);
        const formattedMaxAmount = isUndefined(maxAmount) ? maxAmount : formatAmount(maxAmount);
        const formattedMinAmount = isUndefined(minAmount) ? minAmount : formatAmount(minAmount);

        let formattedValue: string | undefined = undefined;

        switch (amountFormat) {
            case AmountFormat.BETWEEN:
                formattedValue = i18n.get('common.filters.types.amount.range.between', {
                    values: { minAmount: formattedMinAmount, maxAmount: formattedMaxAmount },
                });
                break;

            case AmountFormat.EXACT:
                formattedValue = i18n.get('common.filters.types.amount.range.only', { values: { amount: formattedMaxAmount } });
                break;

            case AmountFormat.MAX:
                formattedValue = i18n.get('common.filters.types.amount.range.max', { values: { amount: formattedMaxAmount } });
                break;

            case AmountFormat.MIN:
                formattedValue = i18n.get('common.filters.types.amount.range.min', { values: { amount: formattedMinAmount } });
                break;

            case AmountFormat.ALL:
            default:
                break;
        }

        setFormattedValue(formattedValue);
    }, [i18n, value]);

    return (
        <BaseFilter<RangeFilterProps>
            {...props}
            updateFilters={updateFilters}
            minAmount={props.minAmount}
            maxAmount={props.maxAmount}
            onChange={onChange}
            value={formattedValue}
            label={formattedValue ? formattedValue : props.label}
            type={'text'}
            containerSize={PopoverContainerSize.MEDIUM}
            selectedCurrencies={selectedCurrencies}
            availableCurrencies={availableCurrencies}
            render={renderAmountFilter}
            aria-label={props.label}
        />
    );
};
