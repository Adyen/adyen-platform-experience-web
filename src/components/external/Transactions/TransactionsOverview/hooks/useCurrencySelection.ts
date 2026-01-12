import useFilterAnalyticsEvent from '../../../../../hooks/useAnalytics/useFilterAnalyticsEvent';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { FilterType } from '../../../../../core/Analytics/analytics/user-events';
import type { SelectItem } from '../../../../internal/FormFields/Select/types';

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

    const getCurrencyIndex = useCallback(
        (currency?: string) => (currency ? (availableCurrencies?.findIndex(currentCurrency => currentCurrency === currency) ?? -1) : -1),
        [availableCurrencies]
    );

    const onCurrencySelection = useCallback(
        ({ target }: { target?: { value: string } }) => {
            const selectedIndex = getCurrencyIndex(target?.value);
            if (selectedIndex >= 0) setSelectedCurrencyIndex(selectedIndex);
        },
        [getCurrencyIndex]
    );

    const [selectedCurrencyIndex, setSelectedCurrencyIndex] = useState(() => getCurrencyIndex(selectedCurrency));
    const activeCurrency = useMemo(() => availableCurrencies?.[selectedCurrencyIndex], [availableCurrencies, selectedCurrencyIndex]);

    const cachedActiveCurrencyRef = useRef<string | undefined>();
    const cachedAvailableCurrencies = useRef(availableCurrencies);
    const cachedSelectedCurrency = useRef(selectedCurrency);

    useEffect(() => {
        if (cachedAvailableCurrencies.current !== availableCurrencies || cachedSelectedCurrency.current !== selectedCurrency) {
            cachedAvailableCurrencies.current = availableCurrencies;
            cachedSelectedCurrency.current = selectedCurrency;
            cachedActiveCurrencyRef.current = undefined;
            setSelectedCurrencyIndex(getCurrencyIndex(selectedCurrency));
        }
    }, [getCurrencyIndex, selectedCurrency]);

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
