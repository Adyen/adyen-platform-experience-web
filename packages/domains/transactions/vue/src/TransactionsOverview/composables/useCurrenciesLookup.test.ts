import { effectScope, ref } from 'vue';
import { describe, expect, test } from 'vitest';
import type { IBalance, ITransactionTotal } from '@integration-components/types';
import { useCurrenciesLookup } from './useCurrenciesLookup';

describe('useCurrenciesLookup', () => {
    const balances: Readonly<IBalance>[] = [
        { currency: 'EUR', reservedValue: 100, value: 1000 },
        { currency: 'USD', reservedValue: 50, value: 500 },
    ];
    const totals: Readonly<ITransactionTotal>[] = [
        { currency: 'EUR', expenses: -200, incomings: 500, total: 300, breakdown: { expenses: [], incomings: [] } },
        { currency: 'GBP', expenses: -100, incomings: 200, total: 100, breakdown: { expenses: [], incomings: [] } },
    ];

    test('merges currency data and supplies zero-value fallbacks', () => {
        const scope = effectScope();
        const lookup = scope.run(() => useCurrenciesLookup(() => ({ defaultCurrency: 'EUR', balances, totals })))!;

        expect(lookup.currenciesDictionary.value).toEqual({
            EUR: { balances: balances[0], totals: totals[0] },
            GBP: {
                balances: { currency: 'GBP', reservedValue: 0, value: 0 },
                totals: totals[1],
            },
            USD: {
                balances: balances[1],
                totals: { currency: 'USD', expenses: 0, incomings: 0, total: 0, breakdown: { expenses: [], incomings: [] } },
            },
        });
        expect(lookup.sortedCurrencies.value).toEqual(['EUR', 'GBP', 'USD']);

        scope.stop();
    });

    test('prioritizes the default currency and updates when input changes', () => {
        const values = ref({ defaultCurrency: 'USD', balances, totals });
        const scope = effectScope();
        const lookup = scope.run(() => useCurrenciesLookup(() => values.value))!;

        expect(lookup.defaultCurrencySortedCurrencies.value).toEqual(['USD', 'EUR', 'GBP']);

        values.value = { defaultCurrency: 'JPY', balances: [], totals: [] };

        expect(lookup.currenciesDictionary.value).toEqual({
            JPY: {
                balances: { currency: 'JPY', reservedValue: 0, value: 0 },
                totals: { currency: 'JPY', expenses: 0, incomings: 0, total: 0, breakdown: { expenses: [], incomings: [] } },
            },
        });
        expect(lookup.defaultCurrencySortedCurrencies.value).toEqual(['JPY']);

        scope.stop();
    });

    test('handles empty inputs', () => {
        const scope = effectScope();
        const lookup = scope.run(() => useCurrenciesLookup(() => ({ defaultCurrency: undefined, balances: [], totals: [] })))!;

        expect(lookup.currenciesDictionary.value).toEqual({});
        expect(lookup.sortedCurrencies.value).toEqual([]);
        expect(lookup.defaultCurrencySortedCurrencies.value).toEqual([]);

        scope.stop();
    });
});
