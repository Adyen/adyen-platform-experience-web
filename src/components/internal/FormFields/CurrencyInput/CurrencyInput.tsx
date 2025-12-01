import { h } from 'preact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import InputBase from '../InputBase';
import { getDecimalAmount, getDivider } from '../../../../core/Localization/amount/amount-util';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { boolOrFalse, EMPTY_OBJECT, uniqueId } from '../../../../utils';
import { CURRENCY_INPUT_BASE_CLASS } from './constants';
import { useFetch } from '../../../../hooks/useFetch';
import { useConfigContext } from '../../../../core/ConfigContext';
import { CurrencyDTO } from '../../../../types/api/models/currencies';

// [TODO]: These utils are reusable and should be located in a shared module
const formatAmount = (amount: number, currency: string) => getDecimalAmount(amount, currency).toFixed(getCurrencyExponent(currency));
const getCurrencyExponent = (currency: string) => Math.log10(getDivider(currency));

interface CurrencyInputProps {
    selectedCurrencyCode?: string;
    hideCurrencySelector?: boolean;
    onCurrencyChange: (value: string) => void;
    currency: string;
    interactionsDisabled?: boolean;
    amount?: number;
    onAmountChange: (amount: number) => void;
    isInvalid?: boolean;
}

export const CurrencyInput = ({
    currency,
    interactionsDisabled,
    amount,
    onAmountChange,
    isInvalid = false,
    hideCurrencySelector,
    selectedCurrencyCode,
    onCurrencyChange,
}: CurrencyInputProps) => {
    const prevCurrency = useRef(currency);
    const { i18n } = useCoreContext();
    const { getCurrencies } = useConfigContext().endpoints;
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

        console.log(computedNumberAmount(value));

        setDisplayValue(value);
        onAmountChange(computedNumberAmount(value));
    };

    const currenciesQuery = useFetch({
        fetchOptions: { enabled: !!getCurrencies },
        queryFn: useCallback(async () => {
            return getCurrencies?.(EMPTY_OBJECT);
        }, [getCurrencies]),
    });

    const currencyDropdownItems = useMemo(() => {
        const currencies: CurrencyDTO[] = currenciesQuery.data?.data ?? [];
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
            dropdown: { items: currencyDropdownItems, value: selectedCurrencyCode, readonly: currenciesQuery.isFetching },
        };
    }, [hideCurrencySelector, currencyDropdownItems, selectedCurrencyCode, currenciesQuery.isFetching, onCurrencyChange]);

    return (
        <div className="adyen-pe-currency-input__container">
            <label htmlFor={inputIdentifier.current} aria-labelledby={labelIdentifier.current}>
                {/* {currency && <Tag label={currency} variant={TagVariant.DEFAULT} />} */}
                <InputBase
                    {...dropdownProps}
                    min={0}
                    type="number"
                    className={CURRENCY_INPUT_BASE_CLASS}
                    disabled={interactionsDisabled || currenciesQuery.isFetching}
                    isInvalid={isInvalid}
                    lang={i18n.locale}
                    onInput={onInput}
                    value={displayValue}
                    uniqueId={inputIdentifier.current}
                />
            </label>
        </div>
    );
};
