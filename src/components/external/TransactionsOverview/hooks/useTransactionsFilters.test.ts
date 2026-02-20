/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook } from '@testing-library/preact';
import { IBalanceAccountBase } from '../../../../types';
import { INITIAL_FILTERS } from '../constants';
import useTransactionsFilters from './useTransactionsFilters';

describe('useTransactionsFilters', () => {
    const mockOnFiltersChange = vi.fn();

    const MOCK_BALANCE_ACCOUNT: IBalanceAccountBase = {
        id: 'BA123',
        description: 'Test Account',
        timeZone: 'Europe/Amsterdam',
        defaultCurrencyCode: 'EUR',
    };

    const MOCK_BALANCE_ACCOUNT_2: IBalanceAccountBase = {
        id: 'BA456',
        description: 'Second Account',
        timeZone: 'America/New_York',
        defaultCurrencyCode: 'USD',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('should initialize with correct default values and call onFiltersChange on mount', () => {
        const { result } = renderHook(() => useTransactionsFilters({ onFiltersChange: mockOnFiltersChange }));

        const expectedInitialFilters = {
            balanceAccount: undefined,
            categories: [],
            createdDate: INITIAL_FILTERS.createdDate,
            currencies: [],
            paymentPspReference: undefined,
            statuses: ['Booked'],
        };

        expect(result.current.filters.value).toEqual(expectedInitialFilters);
        expect(result.current.filters.pristine).toBe(true);
        expect(mockOnFiltersChange).toHaveBeenCalledTimes(1);
        expect(mockOnFiltersChange).toHaveBeenCalledWith(expectedInitialFilters);
    });

    test('should update individual filters and call onFiltersChange', () => {
        const { result } = renderHook(() => useTransactionsFilters({ onFiltersChange: mockOnFiltersChange }));
        const customDateRange = { from: 1000000, to: 2000000, now: Date.now(), timezone: 'UTC' } as any;

        mockOnFiltersChange.mockClear();
        act(() => result.current.statuses.set(['Pending', 'Reversed']));
        expect(result.current.filters.value.statuses).toEqual(['Pending', 'Reversed']);
        expect(mockOnFiltersChange).toHaveBeenCalledTimes(1);

        mockOnFiltersChange.mockClear();
        act(() => result.current.categories.set(['Payment', 'Refund']));
        expect(result.current.filters.value.categories).toEqual(['Payment', 'Refund']);
        expect(mockOnFiltersChange).toHaveBeenCalledTimes(1);

        mockOnFiltersChange.mockClear();
        act(() => result.current.currencies.set(['EUR', 'USD']));
        expect(result.current.filters.value.currencies).toEqual(['EUR', 'USD']);
        expect(mockOnFiltersChange).toHaveBeenCalledTimes(1);

        mockOnFiltersChange.mockClear();
        act(() => result.current.createdDate.set(customDateRange));
        expect(result.current.filters.value.createdDate).toEqual(customDateRange);
        expect(mockOnFiltersChange).toHaveBeenCalledTimes(1);

        mockOnFiltersChange.mockClear();
        act(() => result.current.paymentPspReference.set('PSP123456'));
        expect(result.current.filters.value.paymentPspReference).toBe('PSP123456');
        expect(mockOnFiltersChange).toHaveBeenCalledTimes(1);

        mockOnFiltersChange.mockClear();
        act(() => result.current.balanceAccount.set(MOCK_BALANCE_ACCOUNT));
        expect(result.current.filters.value.balanceAccount).toEqual(MOCK_BALANCE_ACCOUNT);
        expect(mockOnFiltersChange).toHaveBeenCalledTimes(1);
    });

    test('should handle multiple sequential filter updates', () => {
        const { result } = renderHook(() => useTransactionsFilters({ onFiltersChange: mockOnFiltersChange }));

        mockOnFiltersChange.mockClear();
        act(() => {
            result.current.statuses.set(['Pending']);
        });
        act(() => {
            result.current.categories.set(['Payment']);
        });
        act(() => {
            result.current.currencies.set(['EUR']);
        });

        expect(result.current.filters.value).toEqual({
            balanceAccount: undefined,
            categories: ['Payment'],
            createdDate: INITIAL_FILTERS.createdDate,
            currencies: ['EUR'],
            paymentPspReference: undefined,
            statuses: ['Pending'],
        });
        expect(mockOnFiltersChange).toHaveBeenCalledTimes(3);
    });

    test('should detect filter changes and reset filters correctly', () => {
        const { result } = renderHook(() => useTransactionsFilters({ onFiltersChange: mockOnFiltersChange }));

        expect(result.current.filters.pristine).toBe(true);

        act(() => {
            result.current.statuses.set(['Pending', 'Reversed']);
            result.current.categories.set(['Payment', 'Refund']);
            result.current.currencies.set(['EUR', 'USD']);
            result.current.paymentPspReference.set('PSP123');
            result.current.balanceAccount.set(MOCK_BALANCE_ACCOUNT);
        });

        expect(result.current.filters.pristine).toBe(false);

        mockOnFiltersChange.mockClear();
        act(() => result.current.filters.reset());

        expect(result.current.filters.value).toEqual({
            balanceAccount: MOCK_BALANCE_ACCOUNT,
            categories: [],
            createdDate: INITIAL_FILTERS.createdDate,
            currencies: [],
            paymentPspReference: undefined,
            statuses: ['Booked'],
        });
        expect(mockOnFiltersChange).toHaveBeenCalledTimes(1);
        expect(result.current.filters.pristine).toBe(true);
    });

    test('should persist first balance account selection as initial state', () => {
        const { result } = renderHook(() => useTransactionsFilters({ onFiltersChange: mockOnFiltersChange }));

        act(() => result.current.balanceAccount.set(MOCK_BALANCE_ACCOUNT));
        act(() => result.current.filters.reset());
        expect(result.current.filters.value.balanceAccount).toEqual(MOCK_BALANCE_ACCOUNT);

        act(() => result.current.balanceAccount.set(MOCK_BALANCE_ACCOUNT_2));
        expect(result.current.filters.value.balanceAccount).toEqual(MOCK_BALANCE_ACCOUNT_2);

        act(() => result.current.filters.reset());
        expect(result.current.filters.value.balanceAccount).toEqual(MOCK_BALANCE_ACCOUNT);
    });

    test('should maintain stable filters.reset reference across re-renders', () => {
        const { result, rerender } = renderHook(() => useTransactionsFilters({ onFiltersChange: mockOnFiltersChange }));

        const initialReset = result.current.filters.reset;

        rerender();

        expect(result.current.filters.reset).toBe(initialReset);
    });

    test('should detect array and scalar filter changes correctly', () => {
        const { result } = renderHook(() => useTransactionsFilters({ onFiltersChange: mockOnFiltersChange }));

        act(() => result.current.categories.set(['Payment']));
        expect(result.current.filters.pristine).toBe(false);
        act(() => result.current.categories.set([]));
        expect(result.current.filters.pristine).toBe(true);

        act(() => result.current.currencies.set(['EUR']));
        expect(result.current.filters.pristine).toBe(false);
        act(() => result.current.currencies.set([]));
        expect(result.current.filters.pristine).toBe(true);

        act(() => result.current.statuses.set(['Pending', 'Booked']));
        expect(result.current.filters.pristine).toBe(false);
        act(() => result.current.statuses.set(['Booked']));
        expect(result.current.filters.pristine).toBe(true);

        act(() => result.current.paymentPspReference.set('PSP123'));
        expect(result.current.filters.pristine).toBe(false);
        act(() => result.current.paymentPspReference.set(undefined));
        expect(result.current.filters.pristine).toBe(true);
    });

    test('should update filters.value reference when any filter changes', () => {
        const { result } = renderHook(() => useTransactionsFilters({ onFiltersChange: mockOnFiltersChange }));
        const initialFiltersValue = result.current.filters.value;

        act(() => result.current.statuses.set(['Pending']));

        expect(result.current.filters.value).not.toBe(initialFiltersValue);
    });

    test('should expose list and insights query params from current filters', () => {
        const { result } = renderHook(() => useTransactionsFilters({ onFiltersChange: mockOnFiltersChange }));

        act(() => {
            result.current.balanceAccount.set(MOCK_BALANCE_ACCOUNT);
            result.current.categories.set(['Payment', 'Refund']);
            result.current.currencies.set(['EUR', 'USD']);
            result.current.statuses.set(['Pending', 'Reversed']);
            result.current.paymentPspReference.set('PSP123456');
        });

        expect(result.current.listQueryParams).toMatchObject({
            balanceAccountId: 'BA123',
            categories: ['Payment', 'Refund'],
            currencies: ['EUR', 'USD'],
            statuses: ['Pending', 'Reversed'],
            paymentPspReference: 'PSP123456',
        });

        expect(result.current.insightsQueryParams).toEqual({
            balanceAccountId: result.current.listQueryParams.balanceAccountId,
            createdSince: result.current.listQueryParams.createdSince,
            createdUntil: result.current.listQueryParams.createdUntil,
        });

        expect(result.current.filterParams).toMatchObject({
            balanceAccountId: 'BA123',
            categories: 'Payment,Refund',
            currencies: 'EUR,USD',
            statuses: 'Pending,Reversed',
            paymentPspReference: 'PSP123456',
        });
    });

    test('should expose fresh query params references when filters change', () => {
        const { result } = renderHook(() => useTransactionsFilters({ onFiltersChange: mockOnFiltersChange }));

        const initialListQueryParams = result.current.listQueryParams;
        const initialInsightsQueryParams = result.current.insightsQueryParams;

        act(() => result.current.statuses.set(['Pending']));

        expect(result.current.listQueryParams).not.toBe(initialListQueryParams);
        expect(result.current.insightsQueryParams).not.toBe(initialInsightsQueryParams);
    });
});
