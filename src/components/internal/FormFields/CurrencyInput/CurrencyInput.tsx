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

interface CurrencyInputProps {
    amount?: number;
    currency: string;
    currencyItems?: { id: string; name: string }[];
    hideCurrencySelector?: boolean;
    interactionsDisabled?: boolean;
    isInvalid?: boolean;
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
            const exponent = getCurrencyExponent(currency);
            return Math.trunc(+`${parseFloat(value)}e${exponent}`) || 0;
        },
        [currency]
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
        return currencies.map(currency => {
            return {
                id: currency,
                name: currency,
            };
        });
    }, [currenciesQuery.data]);

    const inputIdentifier = useRef(uniqueId());
    const labelIdentifier = useRef(uniqueId());

    const dropdownProps = useMemo(() => {
        if (hideCurrencySelector) {
            return {};
        }

        return {
            onDropdownInput: onCurrencyChange,
            dropdown: {
                items: currencyItems?.length ? currencyItems : currencyDropdownItems,
                value: selectedCurrencyCode,
                readonly: currenciesQuery.isFetching,
            },
        };
    }, [hideCurrencySelector, currencyDropdownItems, currencyItems, selectedCurrencyCode, currenciesQuery.isFetching, onCurrencyChange]);

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
