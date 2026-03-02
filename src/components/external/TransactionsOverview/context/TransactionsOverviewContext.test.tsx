/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi } from 'vitest';
import { renderHook } from '@testing-library/preact';
import { PropsWithChildren } from 'preact/compat';
import { TransactionsView } from '../types';
import { TransactionsOverviewProvider, useTransactionsOverviewContext } from './TransactionsOverviewContext';

vi.mock('../../../../hooks/useAccountBalances', () => ({
    default: () => ({ balances: [], error: undefined, isWaiting: false, canRefresh: false, refresh: vi.fn() }),
}));

vi.mock('../../../../internal/FilterBar', () => ({
    useFilterBarState: () => ({ filterBarElementId: 'transactions-filter-bar', isMobileContainer: false, showingFilters: false }),
}));

vi.mock('../hooks/useCurrenciesLookup', () => ({
    default: () => ({
        currenciesDictionary: {},
        defaultCurrency: undefined,
        defaultCurrencySortedCurrencies: [],
        sortedCurrencies: [],
    }),
}));

vi.mock('../hooks/useTransactionsList', () => ({
    default: () => ({ page: 1, records: [], fields: [], fetching: false }),
}));

vi.mock('../hooks/useTransactionsTotals', () => ({
    default: () => ({ totals: [], error: undefined, canRefresh: false, refresh: vi.fn(), isAvailable: true, isWaiting: false }),
}));

describe('TransactionsOverviewContext', () => {
    const getWrapper =
        (props: { hideInsights?: boolean; mode?: 'overview' | 'insights' }) =>
        ({ children }: PropsWithChildren<{}>) => (
            <TransactionsOverviewProvider balanceAccounts={[]} isLoadingBalanceAccount={false} hideInsights={props.hideInsights} mode={props.mode}>
                {children}
            </TransactionsOverviewProvider>
        );

    test('locks to insights view in insights mode', () => {
        const { result } = renderHook(() => useTransactionsOverviewContext(), {
            wrapper: getWrapper({ mode: 'insights' }),
        });

        expect(result.current.transactionsViewState.activeView).toBe(TransactionsView.INSIGHTS);
        expect(result.current.isTransactionsView).toBe(false);
        expect(result.current.transactionsViewState.viewTabs).toHaveLength(1);
        expect(result.current.transactionsViewState.viewTabs[0]?.id).toBe(TransactionsView.INSIGHTS);
    });

    test('locks to transactions view when hideInsights is true', () => {
        const { result } = renderHook(() => useTransactionsOverviewContext(), {
            wrapper: getWrapper({ hideInsights: true, mode: 'overview' }),
        });

        expect(result.current.transactionsViewState.activeView).toBe(TransactionsView.TRANSACTIONS);
        expect(result.current.isTransactionsView).toBe(true);
        expect(result.current.transactionsViewState.viewTabs).toHaveLength(1);
        expect(result.current.transactionsViewState.viewTabs[0]?.id).toBe(TransactionsView.TRANSACTIONS);
    });
});
