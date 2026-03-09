import { ref, computed, watch } from 'vue';

export interface UseCurrencySelectionProps {
    availableCurrencies?: readonly string[];
    onUpdateSelection?: (currency?: string) => void;
    selectedCurrency?: string;
}

export function useCurrencySelection(props: () => UseCurrencySelectionProps) {
    const currencySelectionOptions = computed(() =>
        Object.freeze(props().availableCurrencies?.map(currency => ({ id: currency, name: currency })) ?? [])
    );

    const getCurrencyIfAvailable = (currency?: string) => {
        const available = props().availableCurrencies;
        const currencyIndex = currency ? (available?.findIndex(c => c === currency) ?? -1) : -1;
        return available?.[currencyIndex];
    };

    const activeCurrency = ref<string | undefined>(getCurrencyIfAvailable(props().selectedCurrency));
    const previousActiveCurrency = ref<string | undefined>();

    const onCurrencySelection = (event: { target?: { value: string } }) => {
        const selected = getCurrencyIfAvailable(event.target?.value);
        if (selected) {
            previousActiveCurrency.value = activeCurrency.value;
            activeCurrency.value = selected;
        }
    };

    // Watch for changes in available currencies or selected currency
    watch(
        () => ({ availableCurrencies: props().availableCurrencies, selectedCurrency: props().selectedCurrency }),
        () => {
            previousActiveCurrency.value = undefined;
            activeCurrency.value = getCurrencyIfAvailable(props().selectedCurrency);
        }
    );

    // Notify parent when active currency changes
    watch(activeCurrency, newCurrency => {
        props().onUpdateSelection?.(newCurrency);
    });

    return { activeCurrency, currencySelectionOptions, onCurrencySelection };
}

export default useCurrencySelection;
