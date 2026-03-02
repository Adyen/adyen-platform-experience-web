import { useAtom } from '../../../../hooks/atoms';
import { useEffect, useRef } from 'preact/hooks';
import useCurrenciesLookup from './useCurrenciesLookup';

type UseCurrenciesLookupResult = ReturnType<typeof useCurrenciesLookup>;

export interface UseTransactionsInsightsCurrencyProps {
    availableCurrencies: UseCurrenciesLookupResult['sortedCurrencies'];
    defaultCurrency?: UseCurrenciesLookupResult['defaultCurrency'];
}

const useTransactionsInsightsCurrency = ({ availableCurrencies, defaultCurrency }: UseTransactionsInsightsCurrencyProps) => {
    const cachedAvailableCurrencies = useRef<typeof availableCurrencies>();
    const cachedDefaultCurrency = useRef<typeof defaultCurrency>();
    const currency = useAtom<string>();

    useEffect(() => {
        const availableCurrenciesChanged = cachedAvailableCurrencies.current !== availableCurrencies;
        const defaultCurrencyChanged = cachedDefaultCurrency.current !== defaultCurrency;

        if (availableCurrenciesChanged || defaultCurrencyChanged) {
            cachedAvailableCurrencies.current = availableCurrencies;
            cachedDefaultCurrency.current = defaultCurrency;
            currency.set(defaultCurrency);
        }
    }, [availableCurrencies, defaultCurrency, currency.set]);

    return { currency } as const;
};

export default useTransactionsInsightsCurrency;
