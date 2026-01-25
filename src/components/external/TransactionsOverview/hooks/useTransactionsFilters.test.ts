/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook, act } from '@testing-library/preact';
import { IBalanceAccountBase } from '../../../../types';
import { TransactionsView } from '../types';
import { INITIAL_FILTERS } from '../constants';
import useTransactionsFilters from './useTransactionsFilters';

describe('useTransactionsFilters', () => {
    const MOCK_BALANCE_ACCOUNT = { id: 'balance_account', timeZone: 'Europe/Amsterdam' } as IBalanceAccountBase;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(0);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    test('should return initial state correctly', () => {
        const { result } = renderHook(() => useTransactionsFilters({ activeView: TransactionsView.TRANSACTIONS }));

        expect(result.current.filters).toEqual(INITIAL_FILTERS);
        expect(result.current.insightsFiltersChanged).toBe(false);
        expect(result.current.insightsFiltersPendingRefresh).toBe(false);
        expect(result.current.transactionsFiltersChanged).toBe(false);
        expect(result.current.transactionsFiltersPendingRefresh).toBe(false);
        expect(result.current.lastFiltersChangeTimestamp).toBe(Date.now());
    });

    test('should require active balance account for changes to be detected', () => {
        const { result } = renderHook(() => useTransactionsFilters({ activeView: TransactionsView.TRANSACTIONS }));
        const newFilters = { ...INITIAL_FILTERS, categories: ['Payment'] as const };

        act(() => result.current.onFiltersChange(newFilters));

        expect(result.current.insightsFiltersChanged).toBe(false);
        expect(result.current.insightsFiltersPendingRefresh).toBe(false);
        expect(result.current.transactionsFiltersChanged).toBe(false);
        expect(result.current.transactionsFiltersPendingRefresh).toBe(false);
    });

    test('should update filters and timestamp when onFiltersChange is called', () => {
        const { result } = renderHook(() => useTransactionsFilters({ activeView: TransactionsView.TRANSACTIONS }));
        const newFilters = { ...INITIAL_FILTERS, balanceAccount: MOCK_BALANCE_ACCOUNT };

        act(() => {
            vi.advanceTimersByTime(1000);
            result.current.onFiltersChange(newFilters);
        });

        expect(result.current.filters).toEqual(newFilters);
        expect(result.current.lastFiltersChangeTimestamp).toBe(Date.now());
    });

    test('should handle filter changes in Transactions view', () => {
        const { result } = renderHook(() => useTransactionsFilters({ activeView: TransactionsView.TRANSACTIONS }));
        const newFilters = { ...INITIAL_FILTERS, balanceAccount: MOCK_BALANCE_ACCOUNT };

        act(() => result.current.onFiltersChange(newFilters));

        expect(result.current.insightsFiltersChanged).toBe(true);
        expect(result.current.insightsFiltersPendingRefresh).toBe(false);
        expect(result.current.transactionsFiltersChanged).toBe(true);
        expect(result.current.transactionsFiltersPendingRefresh).toBe(true);
    });

    test('should handle filter changes in Insights view', () => {
        const { result } = renderHook(() => useTransactionsFilters({ activeView: TransactionsView.INSIGHTS }));
        const newFilters = { ...INITIAL_FILTERS, balanceAccount: MOCK_BALANCE_ACCOUNT };

        act(() => result.current.onFiltersChange(newFilters));

        expect(result.current.insightsFiltersChanged).toBe(true);
        expect(result.current.insightsFiltersPendingRefresh).toBe(true);
        expect(result.current.transactionsFiltersPendingRefresh).toBe(false);
        expect(result.current.transactionsFiltersChanged).toBe(true);
    });

    test('should not trigger insights change for non-insight filters in Insights view', () => {
        const { result } = renderHook(() => useTransactionsFilters({ activeView: TransactionsView.INSIGHTS }));
        act(() => result.current.onFiltersChange({ ...INITIAL_FILTERS, balanceAccount: MOCK_BALANCE_ACCOUNT }));

        act(() => {
            const CHANGED_NON_INSIGHTS_FILTERS = { ...result.current.filters, categories: ['Payment'] as const };
            result.current.onFiltersChange(CHANGED_NON_INSIGHTS_FILTERS);
        });

        expect(result.current.insightsFiltersChanged).toBe(false);
        expect(result.current.transactionsFiltersChanged).toBe(true);
    });

    test('should sync cache when switching views', () => {
        const { result, rerender } = renderHook(({ activeView }) => useTransactionsFilters({ activeView }), {
            initialProps: { activeView: TransactionsView.TRANSACTIONS },
        });
        const newFilters = { ...INITIAL_FILTERS, balanceAccount: MOCK_BALANCE_ACCOUNT };

        act(() => result.current.onFiltersChange(newFilters));

        expect(result.current.transactionsFiltersPendingRefresh).toBe(true);
        expect(result.current.insightsFiltersPendingRefresh).toBe(false);

        rerender({ activeView: TransactionsView.INSIGHTS });

        expect(result.current.insightsFiltersPendingRefresh).toBe(true);
        expect(result.current.transactionsFiltersPendingRefresh).toBe(false);
    });
});
