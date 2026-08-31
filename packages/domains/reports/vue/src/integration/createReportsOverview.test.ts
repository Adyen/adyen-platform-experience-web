/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, type App, type Plugin } from 'vue';
import { REPORTS_CONTEXT } from './context';
import { createReportsOverview } from './createReportsOverview';
import type { ReportsBalanceAccountsSnapshot, ReportsContextValue, ReportsOverviewDependencies, ReportsOverviewRuntimeSnapshot } from './types';

const unmountCallbacks: Array<() => void> = [];
const app = {
    mount: vi.fn(),
    onUnmount: vi.fn((callback: () => void) => unmountCallbacks.push(callback)),
    provide: vi.fn(),
    unmount: vi.fn(() => {
        for (const callback of unmountCallbacks.splice(0)) callback();
    }),
    use: vi.fn((plugin: Plugin) => {
        if (typeof plugin === 'function') plugin(app as unknown as App);
        else plugin.install?.(app as unknown as App);
        return app;
    }),
};
const unsubscribeRuntime = vi.fn();
const unsubscribeBalanceAccounts = vi.fn();
const translations = {
    configure: vi.fn(),
    i18n: { get: vi.fn() },
    provideOverrides: vi.fn(),
};
const createDependencies = () => {
    let runtimeListener: ((snapshot: ReportsOverviewRuntimeSnapshot) => void) | undefined;
    let balanceAccountsListener: ((snapshot: ReportsBalanceAccountsSnapshot) => void) | undefined;
    const runtime = {
        downloadReport: vi.fn(),
        getReports: vi.fn(),
        getSnapshot: vi.fn(() => ({ available: true, refreshing: false })),
        refresh: vi.fn(),
        subscribe: vi.fn(listener => {
            runtimeListener = listener;
            return () => {
                runtimeListener = undefined;
                unsubscribeRuntime();
            };
        }),
    };
    const balanceAccounts = {
        getSnapshot: vi.fn(() => ({ accounts: undefined, error: undefined, loading: true })),
        subscribe: vi.fn(listener => {
            balanceAccountsListener = listener;
            return () => {
                balanceAccountsListener = undefined;
                unsubscribeBalanceAccounts();
            };
        }),
    };
    return {
        balanceAccounts,
        dependencies: { balanceAccounts, runtime, translations } as unknown as ReportsOverviewDependencies,
        publishBalanceAccounts: (snapshot: ReportsBalanceAccountsSnapshot) => balanceAccountsListener?.(snapshot),
        publishRuntime: (snapshot: ReportsOverviewRuntimeSnapshot) => runtimeListener?.(snapshot),
        runtime,
    };
};

const getProvidedContext = (): ReportsContextValue => app.provide.mock.calls.find(([key]) => key === REPORTS_CONTEXT)?.[1] as ReportsContextValue;

vi.mock('vue', async () => {
    const vue = await vi.importActual<typeof import('vue')>('vue');
    return { ...vue, createApp: vi.fn() };
});

vi.mock('@adyen/bento-vue3', () => ({
    default: {},
    BentoLoadingIndicator: 'bento-loading-indicator',
}));

vi.mock('../ReportsOverview/components/ReportsOverview.vue', () => ({
    default: {},
}));

describe('createReportsOverview', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        unmountCallbacks.splice(0);
        vi.mocked(createApp).mockReturnValue(app as never);
        app.mount.mockReturnValue(undefined);
    });

    test('owns Vue mounting, updates, and dependency cleanup without Core', () => {
        const { balanceAccounts, dependencies, runtime } = createDependencies();
        const instance = createReportsOverview({ balanceAccountId: 'BA_1' }, dependencies);
        const target = document.createElement('div');

        instance.mount(target);
        instance.update({ balanceAccountId: 'BA_2' });
        instance.unmount();

        expect(createApp).toHaveBeenCalledOnce();
        expect(app.mount).toHaveBeenCalledWith(target);
        expect(translations.configure).toHaveBeenCalledWith(app);
        expect(runtime.subscribe).toHaveBeenCalledOnce();
        expect(balanceAccounts.subscribe).toHaveBeenCalledOnce();
        expect(unsubscribeBalanceAccounts).toHaveBeenCalledOnce();
        expect(unsubscribeRuntime).toHaveBeenCalledOnce();
        expect(app.unmount).toHaveBeenCalledOnce();
    });

    test('provides reactive runtime and balance-account snapshots', () => {
        const { dependencies, publishBalanceAccounts, publishRuntime, runtime } = createDependencies();
        const instance = createReportsOverview({}, dependencies);

        instance.mount(document.createElement('div'));
        const context = getProvidedContext();

        expect(context.runtime).toMatchObject({ available: true, refreshing: false });
        expect(context.balanceAccounts).toMatchObject({ accounts: undefined, error: undefined, loading: true });

        publishRuntime({ available: false, refreshing: true });
        const accounts = [{ defaultCurrencyCode: 'EUR', id: 'BA_1', timeZone: 'Europe/Amsterdam' }];
        publishBalanceAccounts({ accounts, error: undefined, loading: false });

        expect(context.runtime).toMatchObject({ available: false, refreshing: true });
        expect(context.balanceAccounts).toMatchObject({ accounts, error: undefined, loading: false });

        context.provideTranslationOverrides();
        context.runtime.refresh();
        expect(translations.provideOverrides).toHaveBeenCalledOnce();
        expect(runtime.refresh).toHaveBeenCalledOnce();
    });

    test('resubscribes when remounted', () => {
        const { balanceAccounts, dependencies, runtime } = createDependencies();
        const instance = createReportsOverview({}, dependencies);
        const target = document.createElement('div');

        instance.mount(target);
        instance.unmount();
        instance.mount(target);
        instance.unmount();

        expect(runtime.subscribe).toHaveBeenCalledTimes(2);
        expect(balanceAccounts.subscribe).toHaveBeenCalledTimes(2);
        expect(unsubscribeRuntime).toHaveBeenCalledTimes(2);
        expect(unsubscribeBalanceAccounts).toHaveBeenCalledTimes(2);
    });

    test('cleans up subscriptions when mounting fails', () => {
        const { dependencies } = createDependencies();
        app.mount.mockImplementationOnce(() => {
            throw new Error('mount failed');
        });
        const instance = createReportsOverview({}, dependencies);

        expect(() => instance.mount(document.createElement('div'))).toThrow('mount failed');
        expect(unsubscribeBalanceAccounts).toHaveBeenCalledOnce();
        expect(unsubscribeRuntime).toHaveBeenCalledOnce();
        expect(app.unmount).toHaveBeenCalledOnce();
    });
});
