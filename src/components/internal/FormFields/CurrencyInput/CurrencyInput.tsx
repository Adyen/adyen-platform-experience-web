import { h } from 'preact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import InputBase from '../InputBase';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { EMPTY_OBJECT, uniqueId } from '../../../../utils';
import { CURRENCY_INPUT_BASE_CLASS } from './constants';
import { useFetch } from '../../../../hooks/useFetch';
import { useConfigContext } from '../../../../core/ConfigContext';
import { PaymentLinkCurrencyDTO } from '../../../../types';
import { formatAmount, getCurrencyExponent } from '../../../../utils/currency/main';

const PRIORITIZED_CURRENCY_CODES = ['EUR', 'GBP', 'USD'] as const;

const sortCurrencyItems = <T extends { id: string; name: string }>(items: readonly T[]): T[] => {
    const priorityIndexByCode = new Map<string, number>(PRIORITIZED_CURRENCY_CODES.map((code, index) => [code, index]));

    return [...items].sort((a, b) => {
        const aCode = a.id.toUpperCase();
        const bCode = b.id.toUpperCase();
        const aPriorityIndex = priorityIndexByCode.get(aCode);
        const bPriorityIndex = priorityIndexByCode.get(bCode);

        if (aPriorityIndex !== undefined || bPriorityIndex !== undefined) {
            if (aPriorityIndex === undefined) return 1;
            if (bPriorityIndex === undefined) return -1;
            return aPriorityIndex - bPriorityIndex;
        }

        return aCode.localeCompare(bCode);
    });
};

interface CurrencyInputProps {
    amount?: number;
    currency: string;
    currencyItems?: { id: string; name: string }[];
    hideCurrencySelector?: boolean;
    interactionsDisabled?: boolean;
    isInvalid?: boolean;
    maxValue?: number;
    name?: string;
    onAmountChange: (amount: number) => void;
    onCurrencyChange: (value: string) => void;
    selectedCurrencyCode?: string;
}

export const CurrencyInput = ({
    amount,
    currency,
    currencyItems,
    hideCurrencySelector,
    interactionsDisabled,
    isInvalid = false,
    maxValue,
    name,
    onAmountChange,
    onCurrencyChange,
    selectedCurrencyCode,
}: CurrencyInputProps) => {
    const prevCurrency = useRef(currency);
    const { i18n } = useCoreContext();
    const { currencies: getCurrencies } = useConfigContext().endpoints;
    const [displayValue, setDisplayValue] = useState(amount ? `${formatAmount(amount, currency)}` : '');

    const computedNumberAmount = useCallback(
        (value: string) => {
            const decimalSeparator = (1.1).toLocaleString(i18n.locale).match(/\d(.*?)\d/)?.[1] || '.';
            const normalizedValue = decimalSeparator === '.' ? value : value.replace(decimalSeparator, '.');
            const exponent = getCurrencyExponent(currency);
            return Math.trunc(+`${parseFloat(normalizedValue)}e${exponent}`) || 0;
        },
        [currency, i18n.locale]
    );

    useEffect(() => {
        if (currency !== prevCurrency.current) {
            setDisplayValue(amount ? `${formatAmount(amount, currency)}` : '');
            prevCurrency.current = currency;
        }
    }, [amount, currency]);

    const onInput = (evt: h.JSX.TargetedEvent<HTMLInputElement>) => {
        let value = evt.currentTarget.value.trim();

        // Get the decimal separator based on the user's locale
        const decimalSeparator = (1.1).toLocaleString(i18n.locale).match(/\d(.*?)\d/)?.[1] || '.';
        // Split the input value at the decimal separator
        const parts = value.split(decimalSeparator);

        if (parts.length === 2) {
            const exponent = getCurrencyExponent(currency);

            const integerPart = parts[0]!;
            let decimalPart = parts[1]!;

            if (decimalPart.length >= exponent) {
                decimalPart = decimalPart.substring(0, exponent);
                value = integerPart + decimalSeparator + decimalPart;
                evt.currentTarget.value = value;
            }
        }

        if (value.endsWith(decimalSeparator)) {
            value = value.slice(0, -decimalSeparator.length);
            evt.currentTarget.value = value;
        }

        if (typeof maxValue === 'number') {
            const normalizedValue = decimalSeparator === '.' ? value : value.replace(decimalSeparator, '.');
            const parsed = parseFloat(normalizedValue);

            if (Number.isFinite(parsed) && parsed > maxValue) {
                const exponent = getCurrencyExponent(currency);
                const fixed = maxValue.toFixed(exponent);
                value = decimalSeparator === '.' ? fixed : fixed.replace('.', decimalSeparator);
                evt.currentTarget.value = value;
            }
        }

        setDisplayValue(value);
        onAmountChange(computedNumberAmount(value));
    };

    const currenciesQuery = useFetch({
        fetchOptions: { enabled: !!getCurrencies && !currencyItems?.length },
        queryFn: useCallback(async () => {
            return getCurrencies?.(EMPTY_OBJECT);
        }, [getCurrencies]),
    });

    const currencyDropdownItems = useMemo(() => {
        const currencies: PaymentLinkCurrencyDTO = currenciesQuery.data?.data ?? [];
        const items = currencies.map(currency => {
            return {
                id: currency,
                name: currency,
            };
        });
        return sortCurrencyItems(items);
    }, [currenciesQuery.data]);

    const sortedCurrencyItems = useMemo(() => {
        const items = currencyItems?.length ? currencyItems : currencyDropdownItems;
        return sortCurrencyItems(items);
    }, [currencyDropdownItems, currencyItems]);

    const inputIdentifier = useRef(uniqueId());
    const labelIdentifier = useRef(uniqueId());

    const dropdownProps = useMemo(() => {
        if (hideCurrencySelector) {
            return {};
        }

        return {
            onDropdownInput: onCurrencyChange,
            dropdown: {
                items: sortedCurrencyItems,
                value: selectedCurrencyCode,
                readonly: currenciesQuery.isFetching,
            },
        };
    }, [hideCurrencySelector, sortedCurrencyItems, selectedCurrencyCode, currenciesQuery.isFetching, onCurrencyChange]);

    return (
        <div className="adyen-pe-currency-input__container">
            <label htmlFor={inputIdentifier.current} aria-labelledby={labelIdentifier.current}>
                {/* {currency && <Tag label={currency} variant={TagVariant.DEFAULT} />} */}
                <InputBase
                    {...dropdownProps}
                    type="number"
                    className={CURRENCY_INPUT_BASE_CLASS}
                    disabled={interactionsDisabled || currenciesQuery.isFetching}
                    isInvalid={isInvalid}
                    lang={i18n.locale}
                    min={0}
                    name={name}
                    onInput={onInput}
                    uniqueId={inputIdentifier.current}
                    value={displayValue}
                />
            </label>
        </div>
    );
};
