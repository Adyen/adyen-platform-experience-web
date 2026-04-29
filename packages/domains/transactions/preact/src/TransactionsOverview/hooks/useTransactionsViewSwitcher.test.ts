/**
 * @vitest-environment jsdom
 */
import { describe, expect, test } from 'vitest';
import { act, renderHook } from '@testing-library/preact';
import { TRANSACTIONS_VIEW_TABS } from '../constants';
import { TransactionsView } from '../types';
import useTransactionsViewSwitcher from './useTransactionsViewSwitcher';

describe('useTransactionsViewSwitcher', () => {
    test('should return default state when no view is provided', () => {
        const { result } = renderHook(() => useTransactionsViewSwitcher());
        expect(result.current.activeView).toBe(TransactionsView.TRANSACTIONS);
        expect(result.current.viewTabs).toEqual(TRANSACTIONS_VIEW_TABS);
    });

    test('should return specific state when view is provided', () => {
        const { result } = renderHook(() => useTransactionsViewSwitcher({ view: TransactionsView.INSIGHTS }));
        expect(result.current.activeView).toBe(TransactionsView.INSIGHTS);
        expect(result.current.viewTabs).toHaveLength(1);
        expect(result.current.viewTabs[0]?.id).toBe(TransactionsView.INSIGHTS);
    });

    test('should handle invalid view prop by falling back to default', () => {
        const { result } = renderHook(() => useTransactionsViewSwitcher({ view: 'invalid-view' } as any));
        expect(result.current.activeView).toBe(TransactionsView.TRANSACTIONS);
        expect(result.current.viewTabs).toEqual(TRANSACTIONS_VIEW_TABS);
    });

    test('should allow switching views when no view prop is provided', () => {
        const { result } = renderHook(() => useTransactionsViewSwitcher());
        expect(result.current.activeView).toBe(TransactionsView.TRANSACTIONS);

        act(() => result.current.onViewChange({ id: TransactionsView.INSIGHTS }));
        expect(result.current.activeView).toBe(TransactionsView.INSIGHTS);
    });

    test('should not allow switching to a view not in viewTabs', () => {
        const { result } = renderHook(() => useTransactionsViewSwitcher({ view: TransactionsView.INSIGHTS }));
        expect(result.current.activeView).toBe(TransactionsView.INSIGHTS);

        act(() => result.current.onViewChange({ id: TransactionsView.TRANSACTIONS }));
        expect(result.current.activeView).toBe(TransactionsView.INSIGHTS);
    });

    test('should update activeView when view prop changes', () => {
        const { result, rerender } = renderHook(view => useTransactionsViewSwitcher({ view }), {
            initialProps: TransactionsView.TRANSACTIONS,
        });

        expect(result.current.activeView).toBe(TransactionsView.TRANSACTIONS);
        expect(result.current.viewTabs[0]?.id).toBe(TransactionsView.TRANSACTIONS);
        expect(result.current.viewTabs).toHaveLength(1);

        rerender(TransactionsView.INSIGHTS);
        expect(result.current.activeView).toBe(TransactionsView.INSIGHTS);
        expect(result.current.viewTabs[0]?.id).toBe(TransactionsView.INSIGHTS);
        expect(result.current.viewTabs).toHaveLength(1);
    });
});
