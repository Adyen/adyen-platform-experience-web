/**
 * @vitest-environment jsdom
 */
import { describe, expect, test } from 'vitest';
import { act, renderHook } from '@testing-library/preact';
import { TRANSACTIONS_VIEW_TABS } from '../constants';
import { TransactionsView, TransactionsOverviewMode } from '../types';
import useTransactionsViewSwitcher from './useTransactionsViewSwitcher';

describe('useTransactionsViewSwitcher', () => {
    test('should return default state when no mode is provided', () => {
        const { result } = renderHook(() => useTransactionsViewSwitcher());
        expect(result.current.activeView).toBe(TransactionsView.TRANSACTIONS);
        expect(result.current.viewTabs).toEqual(TRANSACTIONS_VIEW_TABS);
        expect(result.current.isTransactionsView).toBe(true);
    });

    test('should return specific state when mode is provided', () => {
        const { result } = renderHook(() => useTransactionsViewSwitcher({ mode: 'insights' }));
        expect(result.current.activeView).toBe(TransactionsView.INSIGHTS);
        expect(result.current.viewTabs).toHaveLength(1);
        expect(result.current.viewTabs[0]?.id).toBe(TransactionsView.INSIGHTS);
        expect(result.current.isTransactionsView).toBe(false);
    });

    test('should return transactions view when mode is transactions', () => {
        const { result } = renderHook(() => useTransactionsViewSwitcher({ mode: 'transactions' }));
        expect(result.current.activeView).toBe(TransactionsView.TRANSACTIONS);
        expect(result.current.viewTabs).toHaveLength(1);
        expect(result.current.viewTabs[0]?.id).toBe(TransactionsView.TRANSACTIONS);
        expect(result.current.isTransactionsView).toBe(true);
    });

    test('should return full view tabs when mode is overview', () => {
        const { result } = renderHook(() => useTransactionsViewSwitcher({ mode: 'overview' }));
        expect(result.current.activeView).toBe(TransactionsView.TRANSACTIONS);
        expect(result.current.viewTabs).toEqual(TRANSACTIONS_VIEW_TABS);
        expect(result.current.isTransactionsView).toBe(true);
    });

    test('should handle invalid mode prop by falling back to default', () => {
        const { result } = renderHook(() => useTransactionsViewSwitcher({ mode: 'invalid-mode' as any }));
        expect(result.current.activeView).toBe(TransactionsView.TRANSACTIONS);
        expect(result.current.viewTabs).toEqual(TRANSACTIONS_VIEW_TABS);
        expect(result.current.isTransactionsView).toBe(true);
    });

    test('should allow switching views when no mode prop is provided', () => {
        const { result } = renderHook(() => useTransactionsViewSwitcher());
        expect(result.current.activeView).toBe(TransactionsView.TRANSACTIONS);
        expect(result.current.isTransactionsView).toBe(true);

        act(() => result.current.onViewChange({ id: TransactionsView.INSIGHTS }));
        expect(result.current.activeView).toBe(TransactionsView.INSIGHTS);
        expect(result.current.isTransactionsView).toBe(false);
    });

    test('should not allow switching to a view not in viewTabs', () => {
        const { result } = renderHook(() => useTransactionsViewSwitcher({ mode: 'insights' }));
        expect(result.current.activeView).toBe(TransactionsView.INSIGHTS);
        expect(result.current.isTransactionsView).toBe(false);

        act(() => result.current.onViewChange({ id: TransactionsView.TRANSACTIONS }));
        expect(result.current.activeView).toBe(TransactionsView.INSIGHTS);
        expect(result.current.isTransactionsView).toBe(false);
    });

    test('should update activeView when mode prop changes', () => {
        const { result, rerender } = renderHook(mode => useTransactionsViewSwitcher({ mode }), {
            initialProps: 'overview' as TransactionsOverviewMode,
        });

        expect(result.current.activeView).toBe(TransactionsView.TRANSACTIONS);
        expect(result.current.viewTabs).toEqual(TRANSACTIONS_VIEW_TABS);
        expect(result.current.isTransactionsView).toBe(true);

        rerender('insights' as TransactionsOverviewMode);
        expect(result.current.activeView).toBe(TransactionsView.INSIGHTS);
        expect(result.current.viewTabs[0]?.id).toBe(TransactionsView.INSIGHTS);
        expect(result.current.viewTabs).toHaveLength(1);
        expect(result.current.isTransactionsView).toBe(false);

        rerender('transactions' as TransactionsOverviewMode);
        expect(result.current.activeView).toBe(TransactionsView.TRANSACTIONS);
        expect(result.current.viewTabs[0]?.id).toBe(TransactionsView.TRANSACTIONS);
        expect(result.current.viewTabs).toHaveLength(1);
        expect(result.current.isTransactionsView).toBe(true);
    });
});
