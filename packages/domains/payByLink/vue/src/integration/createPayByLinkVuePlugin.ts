import { createDomainVuePlugin, type DisposableVuePlugin } from '@integration-components/composables-vue/createDomainVuePlugin';
import { PAY_BY_LINK_CONTEXT } from './context';
import type { PayByLinkDependencies } from './types';

const emptySnapshotSource = {
    getSnapshot: () => ({}),
    subscribe: () => () => undefined,
};

export const createPayByLinkVuePlugin = (dependencies: PayByLinkDependencies): DisposableVuePlugin =>
    createDomainVuePlugin({
        balanceAccounts: emptySnapshotSource,
        contextKey: PAY_BY_LINK_CONTEXT,
        createContext: ({ runtime }) => ({
            i18n: dependencies.translations.i18n,
            provideTranslationOverrides: dependencies.translations.provideOverrides,
            runtime,
        }),
        createRuntime: snapshot => ({
            ...snapshot,
            getCdnConfig: dependencies.runtime.getCdnConfig.bind(dependencies.runtime),
            getCdnDataset: dependencies.runtime.getCdnDataset.bind(dependencies.runtime),
            refresh: dependencies.runtime.refresh.bind(dependencies.runtime),
        }),
        runtime: dependencies.runtime,
        syncBalanceAccounts: () => undefined,
        syncRuntime: (current, next) => Object.assign(current, next),
        translations: dependencies.translations,
    });
