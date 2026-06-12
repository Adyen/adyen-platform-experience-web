import { computed } from 'vue';
import type { IBalance, ITransactionTotal } from '@integration-components/types';

export interface CurrencyLookupRecord {
    balances: Readonly<IBalance>;
    totals: Readonly<ITransactionTotal>;
}

interface UseCurrenciesLookupProps {
    defaultCurrency?: string;
    balances: readonly Readonly<IBalance>[];
    totals: readonly Readonly<ITransactionTotal>[];
}

const getCurrencyLookupRecord = (currency: string, lookupMap?: Map<string, CurrencyLookupRecord>) => {
    let lookupRecord = lookupMap?.get(currency);
    if (lookupRecord === undefined) {
        lookupRecord = {
            balances: { currency, reservedValue: 0, value: 0 },
            totals: {
                currency,
                expenses: 0,
                incomings: 0,
                total: 0,
                breakdown: { expenses: [] as const, incomings: [] as const } as const,
            },
        };
        lookupMap?.set(currency, lookupRecord);
    }
    return lookupRecord;
};

export function useCurrenciesLookup(props: () => UseCurrenciesLookupProps) {
    const currenciesDictionary = computed(() => {
        const { defaultCurrency, balances, totals } = props();
        const map = new Map<string, CurrencyLookupRecord>(defaultCurrency ? [[defaultCurrency, getCurrencyLookupRecord(defaultCurrency)]] : []);
        for (const b of balances) {
            const rec = getCurrencyLookupRecord(b.currency, map);
            rec.balances = b;
        }
        for (const t of totals) {
            const rec = getCurrencyLookupRecord(t.currency, map);
            rec.totals = t;
        }
        const sorted = [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
        return Object.freeze(Object.fromEntries(sorted));
    });

    const sortedCurrencies = computed(() => Object.freeze(Object.keys(currenciesDictionary.value)));

    const defaultCurrencySortedCurrencies = computed(() => {
        const defaultCurrency = props().defaultCurrency;
        const currencies = sortedCurrencies.value;
        if (defaultCurrency && currencies.includes(defaultCurrency)) {
            return Object.freeze([defaultCurrency, ...currencies.filter(c => c !== defaultCurrency)]);
        }
        return currencies;
    });

    return {
        currenciesDictionary,
        sortedCurrencies,
        defaultCurrencySortedCurrencies,
        defaultCurrency: computed(() => props().defaultCurrency),
    } as const;
}
