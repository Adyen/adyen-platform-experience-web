import { useMemo } from 'preact/hooks';
import { IBalance, ITransactionTotal } from '../../../../types';

const getCurrencyLookupRecord = (currency: string, lookupMap?: Map<string, CurrencyLookupRecord>) => {
    let lookupRecord = lookupMap?.get(currency);

    if (lookupRecord === undefined) {
        // Initialize currency lookup record
        lookupRecord = {
            balances: { currency, reservedValue: 0, value: 0 },
            totals: {
                currency,
                expenses: 0,
                incomings: 0,
                total: 0,
                breakdown: {
                    expenses: [] as const,
                    incomings: [] as const,
                } as const,
            },
        };

        lookupMap?.set(currency, lookupRecord);
    }

    return lookupRecord;
};

export interface CurrencyLookupRecord {
    balances: Readonly<IBalance>;
    totals: Readonly<ITransactionTotal>;
}

export interface UseCurrencyLookupProps {
    defaultCurrency?: string;
    balances: readonly Readonly<IBalance>[];
    totals: readonly Readonly<ITransactionTotal>[];
}

const useCurrenciesLookup = ({ defaultCurrency, balances, totals }: UseCurrencyLookupProps) => {
    const currenciesDictionary = useMemo(() => {
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

        return Object.freeze(Object.fromEntries(sortedCurrencies));
    }, [defaultCurrency, balances, totals]);

    const sortedCurrencies = useMemo(() => Object.freeze(Object.keys(currenciesDictionary)), [currenciesDictionary]);

    const defaultCurrencySortedCurrencies = useMemo(
        () =>
            Object.freeze(
                [...sortedCurrencies].sort((firstCurrency, secondCurrency) => {
                    if (defaultCurrency) {
                        if (firstCurrency === defaultCurrency) return -1;
                        if (secondCurrency === defaultCurrency) return 1;
                    }
                    return 0; // currencies already sorted alphabetically
                })
            ),
        [sortedCurrencies]
    );

    return { currenciesDictionary, defaultCurrency, defaultCurrencySortedCurrencies, sortedCurrencies } as const;
};

export default useCurrenciesLookup;
