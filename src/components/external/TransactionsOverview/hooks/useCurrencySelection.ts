import useFilterAnalyticsEvent from '../../../../hooks/useAnalytics/useFilterAnalyticsEvent';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { FilterType } from '../../../../core/Analytics/analytics/user-events';
import type { SelectItem } from '../../../internal/FormFields/Select/types';

export interface UseCurrencySelectionProps {
    availableCurrencies?: readonly string[];
    eventCategory?: string;
    eventSubCategory?: string;
    eventLabel?: FilterType;
    onUpdateSelection?: (currency?: string) => void;
    selectedCurrency?: string;
}

const useCurrencySelection = ({
    availableCurrencies,
    eventCategory,
    eventSubCategory,
    eventLabel,
    onUpdateSelection,
    selectedCurrency,
}: UseCurrencySelectionProps) => {
    const { logEvent } = useFilterAnalyticsEvent({ category: eventCategory, subCategory: eventSubCategory, label: eventLabel });

    const currencySelectionOptions = useMemo(
        () => Object.freeze(availableCurrencies?.map((currency): SelectItem => ({ id: currency, name: currency })) ?? []),
        [availableCurrencies]
    );

    const getCurrencyIfAvailable = useCallback(
        (currency?: string) => {
            const currencyIndex = currency ? (availableCurrencies?.findIndex(currentCurrency => currentCurrency === currency) ?? -1) : -1;
            return availableCurrencies?.[currencyIndex];
        },
        [availableCurrencies]
    );

    const [activeCurrency, setActiveCurrency] = useState(() => getCurrencyIfAvailable(selectedCurrency));

    const cachedActiveCurrencyRef = useRef<string | undefined>();
    const cachedAvailableCurrenciesRef = useRef(availableCurrencies);
    const cachedSelectedCurrencyRef = useRef(selectedCurrency);

    const onCurrencySelection = useCallback(
        ({ target }: { target?: { value: string } }) => {
            const selectedCurrency = getCurrencyIfAvailable(target?.value);
            if (selectedCurrency) {
                cachedActiveCurrencyRef.current = activeCurrency;
                setActiveCurrency(selectedCurrency);
            }
        },
        [getCurrencyIfAvailable, activeCurrency]
    );

    useEffect(() => {
        if (cachedAvailableCurrenciesRef.current !== availableCurrencies || cachedSelectedCurrencyRef.current !== selectedCurrency) {
            cachedAvailableCurrenciesRef.current = availableCurrencies;
            cachedSelectedCurrencyRef.current = selectedCurrency;
            cachedActiveCurrencyRef.current = undefined;
            setActiveCurrency(getCurrencyIfAvailable(selectedCurrency));
        }
    }, [getCurrencyIfAvailable, selectedCurrency]);

    useEffect(() => {
        const cachedActiveCurrency = cachedActiveCurrencyRef.current;

        if (cachedActiveCurrency !== activeCurrency) {
            // Update the cached active currency with the active one
            cachedActiveCurrencyRef.current = activeCurrency;

            if (cachedActiveCurrency && activeCurrency) {
                // Currency selection changed
                // Log filter modification event
                logEvent?.('update', activeCurrency);
            }

            onUpdateSelection?.(activeCurrency);
        }
    }, [activeCurrency, logEvent, onUpdateSelection]);

    return { activeCurrency, currencySelectionOptions, onCurrencySelection } as const;
};

export default useCurrencySelection;
