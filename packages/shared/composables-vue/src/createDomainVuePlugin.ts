import { shallowReactive, type App, type InjectionKey, type Plugin } from 'vue';
import BentoVue from '@adyen/bento-vue3';

type SnapshotSource<Snapshot> = Readonly<{
    getSnapshot(): Snapshot;
    subscribe(listener: (snapshot: Snapshot) => void): () => void;
}>;

type DomainTranslations = Readonly<{
    configure(app: App): void;
}>;

export type DisposableVuePlugin = Plugin & Readonly<{ dispose(): void }>;

export type CreateDomainVuePluginOptions<
    RuntimeSnapshot extends object,
    BalanceAccountsSnapshot extends object,
    RuntimeContext extends object,
    Context,
    Translations extends DomainTranslations,
> = Readonly<{
    balanceAccounts: SnapshotSource<BalanceAccountsSnapshot>;
    contextKey: InjectionKey<Context>;
    createContext(input: { balanceAccounts: BalanceAccountsSnapshot; runtime: RuntimeContext; translations: Translations }): Context;
    createRuntime(snapshot: RuntimeSnapshot): RuntimeContext;
    runtime: SnapshotSource<RuntimeSnapshot>;
    syncBalanceAccounts(current: BalanceAccountsSnapshot, next: BalanceAccountsSnapshot): void;
    syncRuntime(current: RuntimeContext, next: RuntimeSnapshot): void;
    translations: Translations;
}>;

export const createDomainVuePlugin = <
    RuntimeSnapshot extends object,
    BalanceAccountsSnapshot extends object,
    RuntimeContext extends object,
    Context,
    Translations extends DomainTranslations,
>(
    options: CreateDomainVuePluginOptions<RuntimeSnapshot, BalanceAccountsSnapshot, RuntimeContext, Context, Translations>
): DisposableVuePlugin => {
    const cleanups = new Set<() => void>();
    const dispose = () => {
        for (const cleanup of cleanups) cleanup();
        cleanups.clear();
    };

    return {
        dispose,
        install(app) {
            const runtime = shallowReactive(options.createRuntime(options.runtime.getSnapshot())) as RuntimeContext;
            const balanceAccounts = shallowReactive({ ...options.balanceAccounts.getSnapshot() }) as BalanceAccountsSnapshot;
            const context = options.createContext({ balanceAccounts, runtime, translations: options.translations });
            const unsubscribeRuntime = options.runtime.subscribe(next => options.syncRuntime(runtime, next));
            const unsubscribeBalanceAccounts = options.balanceAccounts.subscribe(next => options.syncBalanceAccounts(balanceAccounts, next));
            let disposed = false;
            const cleanup = () => {
                if (disposed) return;
                disposed = true;
                unsubscribeBalanceAccounts();
                unsubscribeRuntime();
                cleanups.delete(cleanup);
            };
            cleanups.add(cleanup);

            options.translations.configure(app);
            app.use(BentoVue, { withToast: true, withDesignTokensCSSInjection: false });
            app.provide(options.contextKey, context);
            app.onUnmount(cleanup);
        },
    };
};
