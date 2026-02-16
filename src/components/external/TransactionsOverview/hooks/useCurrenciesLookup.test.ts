/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/preact';
import { describe, expect, test } from 'vitest';
import useCurrenciesLookup, { UseCurrencyLookupProps } from './useCurrenciesLookup';
import { IBalance, ITransactionTotal } from '../../../../types';

describe('useCurrenciesLookup', () => {
    const MOCK_BALANCES: Readonly<IBalance>[] = [
        { currency: 'EUR', reservedValue: 100, value: 1000 },
        { currency: 'USD', reservedValue: 50, value: 500 },
    ];

    const MOCK_TOTALS: Readonly<ITransactionTotal>[] = [
        {
            currency: 'EUR',
            expenses: -200,
            incomings: 500,
            total: 300,
            breakdown: { expenses: [], incomings: [] },
        },
        {
            currency: 'GBP',
            expenses: -100,
            incomings: 200,
            total: 100,
            breakdown: { expenses: [], incomings: [] },
        },
    ];

    test('should merge balances and totals into currenciesDictionary correctly', () => {
        const props: UseCurrencyLookupProps = {
            defaultCurrency: 'EUR',
            balances: MOCK_BALANCES,
            totals: MOCK_TOTALS,
        };

        const { result } = renderHook(() => useCurrenciesLookup(props));
        expect(Object.keys(result.current.currenciesDictionary)).toEqual(['EUR', 'GBP', 'USD']);

        expect(result.current.currenciesDictionary.EUR).toEqual({
            balances: MOCK_BALANCES[0],
            totals: MOCK_TOTALS[0],
        });

        expect(result.current.currenciesDictionary.USD!.balances).toEqual(MOCK_BALANCES[1]);
        expect(result.current.currenciesDictionary.USD!.totals).toEqual({
            currency: 'USD',
            expenses: 0,
            incomings: 0,
            total: 0,
            breakdown: { expenses: [], incomings: [] },
        });

        expect(result.current.currenciesDictionary.GBP!.totals).toEqual(MOCK_TOTALS[1]);
        expect(result.current.currenciesDictionary.GBP!.balances).toEqual({
            currency: 'GBP',
            reservedValue: 0,
            value: 0,
        });
    });

    test('should sort currencies alphabetically in sortedCurrencies', () => {
        const props: UseCurrencyLookupProps = {
            defaultCurrency: 'EUR',
            balances: MOCK_BALANCES, // EUR, USD
            totals: MOCK_TOTALS, // EUR, GBP
        };

        const { result } = renderHook(() => useCurrenciesLookup(props));
        expect(result.current.sortedCurrencies).toEqual(['EUR', 'GBP', 'USD']);
    });

    test('should prioritize defaultCurrency in defaultCurrencySortedCurrencies', () => {
        const props: UseCurrencyLookupProps = {
            defaultCurrency: 'USD',
            balances: MOCK_BALANCES, // EUR, USD
            totals: MOCK_TOTALS, // EUR, GBP
        };

        const { result } = renderHook(() => useCurrenciesLookup(props));
        expect(result.current.defaultCurrencySortedCurrencies).toEqual(['USD', 'EUR', 'GBP']);
    });

    test('should maintain alphabetical order in defaultCurrencySortedCurrencies when defaultCurrency is undefined', () => {
        const props: UseCurrencyLookupProps = {
            defaultCurrency: undefined,
            balances: MOCK_BALANCES,
            totals: MOCK_TOTALS,
        };

        const { result } = renderHook(() => useCurrenciesLookup(props));
        expect(result.current.defaultCurrencySortedCurrencies).toEqual(['EUR', 'GBP', 'USD']);
    });

    test('should handle empty inputs gracefully', () => {
        const props: UseCurrencyLookupProps = {
            defaultCurrency: undefined,
            balances: [],
            totals: [],
        };

        const { result } = renderHook(() => useCurrenciesLookup(props));

        expect(result.current.currenciesDictionary).toEqual({});
        expect(result.current.sortedCurrencies).toEqual([]);
        expect(result.current.defaultCurrencySortedCurrencies).toEqual([]);
    });

    test('should include defaultCurrency in dictionary even if no data exists for it', () => {
        const props: UseCurrencyLookupProps = {
            defaultCurrency: 'JPY',
            balances: [],
            totals: [],
        };

        const { result } = renderHook(() => useCurrenciesLookup(props));

        expect(Object.keys(result.current.currenciesDictionary)).toEqual(['JPY']);

        expect(result.current.currenciesDictionary.JPY).toEqual({
            balances: { currency: 'JPY', reservedValue: 0, value: 0 },
            totals: {
                currency: 'JPY',
                expenses: 0,
                incomings: 0,
                total: 0,
                breakdown: { expenses: [], incomings: [] },
            },
        });
    });

    test('should return stable references when dependencies do not change', () => {
        const props: UseCurrencyLookupProps = {
            defaultCurrency: 'EUR',
            balances: MOCK_BALANCES,
            totals: MOCK_TOTALS,
        };

        const { result, rerender } = renderHook(p => useCurrenciesLookup(p), { initialProps: props });
        const firstResult = result.current;

        rerender(props);

        expect(result.current.currenciesDictionary).toBe(firstResult.currenciesDictionary);
        expect(result.current.sortedCurrencies).toBe(firstResult.sortedCurrencies);
        expect(result.current.defaultCurrencySortedCurrencies).toBe(firstResult.defaultCurrencySortedCurrencies);
    });
});
