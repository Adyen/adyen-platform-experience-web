/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook } from '@testing-library/preact';
import useTransactionsInsightsCurrency, { UseTransactionsInsightsCurrencyProps } from './useTransactionsInsightsCurrency';

describe('useTransactionsInsightsCurrency', () => {
    const CURRENCIES_V1 = Object.freeze(['EUR', 'USD']);
    const CURRENCIES_V2 = Object.freeze(['EUR', 'USD', 'GBP']);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('should initialize with undefined currency value', () => {
        const initialProps: UseTransactionsInsightsCurrencyProps = { availableCurrencies: CURRENCIES_V1, defaultCurrency: 'EUR' };
        const { result, rerender } = renderHook(props => useTransactionsInsightsCurrency(props), { initialProps });
        const initialResult = result.current;

        expect(result.current.currency.value).toBe('EUR');

        act(() => rerender(initialProps));

        // should not update when props are unchanged on rerender
        expect(result.current).toStrictEqual(initialResult);
        expect(result.current.currency.value).toBe('EUR');
    });

    test('should set currency to defaultCurrency when availableCurrencies reference changes', () => {
        const initialProps: UseTransactionsInsightsCurrencyProps = { availableCurrencies: CURRENCIES_V1, defaultCurrency: 'EUR' };
        const { result, rerender } = renderHook(props => useTransactionsInsightsCurrency(props), { initialProps });
        const initialResult = result.current;

        expect(result.current.currency.value).toBe('EUR');

        act(() => rerender({ ...initialProps, availableCurrencies: CURRENCIES_V2 }));

        expect(result.current).toStrictEqual(initialResult);
        expect(result.current.currency.value).toBe('EUR');
    });

    test('should set currency to new defaultCurrency when defaultCurrency changes', () => {
        const initialProps: UseTransactionsInsightsCurrencyProps = { availableCurrencies: CURRENCIES_V1, defaultCurrency: 'EUR' };
        const { result, rerender } = renderHook(props => useTransactionsInsightsCurrency(props), { initialProps });
        const initialResult = result.current;

        expect(result.current.currency.value).toBe('EUR');

        act(() => rerender({ ...initialProps, defaultCurrency: 'USD' }));

        expect(result.current).not.toStrictEqual(initialResult);
        expect(result.current.currency.value).toBe('USD');
    });

    test('should set currency to undefined when defaultCurrency changes to undefined', () => {
        const initialProps: UseTransactionsInsightsCurrencyProps = { availableCurrencies: CURRENCIES_V1, defaultCurrency: 'EUR' };
        const { result, rerender } = renderHook(props => useTransactionsInsightsCurrency(props), { initialProps });
        const initialResult = result.current;

        expect(result.current.currency.value).toBe('EUR');

        act(() => rerender({ ...initialProps, defaultCurrency: undefined }));

        expect(result.current).not.toStrictEqual(initialResult);
        expect(result.current.currency.value).toBeUndefined();
    });
});
