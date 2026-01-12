/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/preact';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import useCurrencySelection from './useCurrencySelection';
import useFilterAnalyticsEvent from '../../../../../hooks/useAnalytics/useFilterAnalyticsEvent';

vi.mock('../../../../hooks/useAnalytics/useFilterAnalyticsEvent');

describe('useCurrencySelection', () => {
    const logEventMock = vi.fn();
    const onUpdateSelectionMock = vi.fn();
    const availableCurrencies = ['EUR', 'USD', 'GBP'];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useFilterAnalyticsEvent).mockReturnValue({ logEvent: logEventMock });
    });

    test('should return default values when no props are provided', () => {
        const { result } = renderHook(() => useCurrencySelection({}));

        expect(result.current.activeCurrency).toBeUndefined();
        expect(result.current.currencySelectionOptions).toEqual([]);
    });

    test('should initialize with selected currency when provided', () => {
        const { result } = renderHook(() =>
            useCurrencySelection({
                availableCurrencies,
                selectedCurrency: 'USD',
            })
        );

        expect(result.current.activeCurrency).toBe('USD');
        expect(result.current.currencySelectionOptions).toEqual([
            { id: 'EUR', name: 'EUR' },
            { id: 'USD', name: 'USD' },
            { id: 'GBP', name: 'GBP' },
        ]);
    });

    test('should update active currency when onCurrencySelection is called', () => {
        const { result } = renderHook(() =>
            useCurrencySelection({
                availableCurrencies,
                selectedCurrency: 'EUR',
                onUpdateSelection: onUpdateSelectionMock,
            })
        );

        onUpdateSelectionMock.mockClear();
        logEventMock.mockClear();

        act(() => {
            result.current.onCurrencySelection({ target: { value: 'USD' } });
        });

        expect(result.current.activeCurrency).toBe('USD');
        expect(onUpdateSelectionMock).toHaveBeenCalledWith('USD');
        expect(logEventMock).toHaveBeenCalledWith('update', 'USD');
    });

    test('should ignore invalid currency selection', () => {
        const { result } = renderHook(() =>
            useCurrencySelection({
                availableCurrencies,
                selectedCurrency: 'EUR',
            })
        );

        act(() => {
            result.current.onCurrencySelection({ target: { value: 'JPY' } });
        });

        expect(result.current.activeCurrency).toBe('EUR');
    });

    test('should update active currency when selectedCurrency prop changes', () => {
        const { result, rerender } = renderHook(props => useCurrencySelection(props), {
            initialProps: {
                availableCurrencies,
                selectedCurrency: 'EUR',
                onUpdateSelection: onUpdateSelectionMock,
            },
        });

        expect(result.current.activeCurrency).toBe('EUR');
        onUpdateSelectionMock.mockClear();
        logEventMock.mockClear();

        rerender({
            availableCurrencies,
            selectedCurrency: 'GBP',
            onUpdateSelection: onUpdateSelectionMock,
        });

        expect(result.current.activeCurrency).toBe('GBP');
        expect(onUpdateSelectionMock).toHaveBeenCalledWith('GBP');
        expect(logEventMock).not.toHaveBeenCalled();
    });

    test('should handle availableCurrencies update', () => {
        const { result, rerender } = renderHook(props => useCurrencySelection(props), {
            initialProps: {
                availableCurrencies: ['EUR'],
                selectedCurrency: 'EUR',
                onUpdateSelection: onUpdateSelectionMock,
            },
        });

        expect(result.current.activeCurrency).toBe('EUR');

        // Change available currencies, EUR is no longer available
        rerender({
            availableCurrencies: ['USD'],
            selectedCurrency: 'EUR',
            onUpdateSelection: onUpdateSelectionMock,
        });

        expect(result.current.activeCurrency).toBeUndefined();
    });

    test('should call onUpdateSelection but not logEvent on initial mount', () => {
        renderHook(() =>
            useCurrencySelection({
                availableCurrencies,
                selectedCurrency: 'EUR',
                onUpdateSelection: onUpdateSelectionMock,
            })
        );

        expect(onUpdateSelectionMock).toHaveBeenCalledWith('EUR');
        expect(logEventMock).not.toHaveBeenCalled();
    });

    test('should handle undefined availableCurrencies gracefully', () => {
        const { result } = renderHook(() =>
            useCurrencySelection({
                availableCurrencies: undefined,
                selectedCurrency: 'EUR',
            })
        );

        expect(result.current.activeCurrency).toBeUndefined();
        expect(result.current.currencySelectionOptions).toEqual([]);
    });
});
