import { computed } from 'vue';
import type { IBalance, ITransactionTotal } from '../types';

export interface CurrencyLookupRecord {
    balances: Readonly<IBalance>;
    totals: Readonly<ITransactionTotal>;
}

export interface UseCurrencyLookupProps {
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
                breakdown: {
                    expenses: [],
                    incomings: [],
                },
            },
        };

        lookupMap?.set(currency, lookupRecord);
    }

    return lookupRecord;
};

export function useCurrenciesLookup(props: () => UseCurrencyLookupProps) {
    const currenciesDictionary = computed(() => {
        const { defaultCurrency, balances, totals } = props();
        const currenciesLookupMap = new Map<string, CurrencyLookupRecord>(
            defaultCurrency ? [[defaultCurrency, getCurrencyLookupRecord(defaultCurrency)]] : []
        );

        for (const _balances of balances) {
            const lookupRecord = getCurrencyLookupRecord(_balances.currency, currenciesLookupMap);
            lookupRecord.balances = _balances;
        }

        for (const _totals of totals) {
            const lookupRecord = getCurrencyLookupRecord(_totals.currency, currenciesLookupMap);
            lookupRecord.totals = _totals;
        }

        const sortedCurrencies = [...currenciesLookupMap.entries()].sort(([firstCurrency], [secondCurrency]) =>
            firstCurrency.localeCompare(secondCurrency)
        );

        return Object.freeze(Object.fromEntries(sortedCurrencies)) as Readonly<Record<string, CurrencyLookupRecord>>;
    });

    const sortedCurrencies = computed(() => Object.freeze(Object.keys(currenciesDictionary.value)));

    const defaultCurrencySortedCurrencies = computed(() => {
        const defCurrency = props().defaultCurrency;
        return Object.freeze(
            [...sortedCurrencies.value].sort((firstCurrency, secondCurrency) => {
                if (defCurrency) {
                    if (firstCurrency === defCurrency) return -1;
                    if (secondCurrency === defCurrency) return 1;
                }
                return 0;
            })
        );
    });

    return {
        currenciesDictionary,
        defaultCurrency: computed(() => props().defaultCurrency),
        defaultCurrencySortedCurrencies,
        sortedCurrencies,
    };
}

export default useCurrenciesLookup;
