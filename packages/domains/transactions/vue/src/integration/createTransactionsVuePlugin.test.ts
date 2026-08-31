/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi } from 'vitest';
import { createApp, defineComponent, h, inject, nextTick, onMounted } from 'vue';
import { TRANSACTIONS_CONTEXT } from './context';
import { createTransactionsVuePlugin } from './createTransactionsVuePlugin';
import type { TransactionsBalanceAccountsSnapshot, TransactionsDependencies, TransactionsRuntimeSnapshot } from './types';

vi.mock('@adyen/bento-vue3', () => ({
    default: { install: vi.fn() },
}));

describe('createTransactionsVuePlugin', () => {
    test('supports direct Vue mounting and cleans up subscriptions on app unmount', async () => {
        let runtimeListener: ((snapshot: TransactionsRuntimeSnapshot) => void) | undefined;
        let accountsListener: ((snapshot: TransactionsBalanceAccountsSnapshot) => void) | undefined;
        const unsubscribeRuntime = vi.fn();
        const unsubscribeAccounts = vi.fn();
        const refresh = vi.fn();
        const provideOverrides = vi.fn();
        const translations = {
            configure: vi.fn(),
            i18n: { get: vi.fn() },
            provideOverrides,
        };
        const dependencies = {
            balanceAccounts: {
                getSnapshot: () => ({ accounts: undefined, loading: true }),
                subscribe: (listener: (snapshot: TransactionsBalanceAccountsSnapshot) => void) => {
                    accountsListener = listener;
                    return unsubscribeAccounts;
                },
            },
            runtime: {
                downloadTransactions: vi.fn(),
                getBalances: vi.fn(),
                getSnapshot: () => ({
                    available: true,
                    canDownload: true,
                    canGetBalances: true,
                    canGetTotals: true,
                    canRefund: false,
                    refreshing: false,
                }),
                getTransaction: vi.fn(),
                getTransactions: vi.fn(),
                getTransactionsTotals: vi.fn(),
                initiateRefund: vi.fn(),
                refresh,
                subscribe: (listener: (snapshot: TransactionsRuntimeSnapshot) => void) => {
                    runtimeListener = listener;
                    return unsubscribeRuntime;
                },
            },
            translations,
        } as unknown as TransactionsDependencies;
        const Root = defineComponent({
            setup() {
                const context = inject(TRANSACTIONS_CONTEXT);
                if (!context) throw new Error('Missing Transactions context');
                context.provideTranslationOverrides();
                onMounted(() => context.runtime.refresh());
                return () =>
                    h('div', {
                        'data-accounts-loading': String(context.balanceAccounts.loading),
                        'data-refreshing': String(context.runtime.refreshing),
                    });
            },
        });
        const target = document.createElement('div');
        const app = createApp(Root);

        app.use(createTransactionsVuePlugin(dependencies));
        app.mount(target);

        expect(translations.configure).toHaveBeenCalledWith(app);
        expect(provideOverrides).toHaveBeenCalledOnce();
        expect(refresh).toHaveBeenCalledOnce();

        runtimeListener?.({
            available: true,
            canDownload: true,
            canGetBalances: true,
            canGetTotals: true,
            canRefund: false,
            refreshing: true,
        });
        accountsListener?.({ accounts: [], loading: false });
        await nextTick();

        expect(target.firstElementChild?.getAttribute('data-refreshing')).toBe('true');
        expect(target.firstElementChild?.getAttribute('data-accounts-loading')).toBe('false');

        app.unmount();
        expect(unsubscribeAccounts).toHaveBeenCalledOnce();
        expect(unsubscribeRuntime).toHaveBeenCalledOnce();
    });
});
