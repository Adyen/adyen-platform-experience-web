import { describe, expect, test, vi } from 'vitest';
import { createConfigController } from '@integration-components/core';
import { createDomainTranslationVueBinding } from '@integration-components/core/vue/translationBinding';
import { REPORTS_EN_US } from '@integration-components/reports/domain';
import { bindReportsOverview } from './bindReportsOverview';

const mocks = vi.hoisted(() => ({
    bindDependencies: undefined as
        | ((input: { signal: AbortSignal }) =>
              | {
                    dependencies: {
                        balanceAccounts: { getSnapshot(): unknown; subscribe(listener: (snapshot: unknown) => void): () => void };
                        runtime: { getSnapshot(): unknown };
                        translations: { configure(app: { use(plugin: unknown): void }): void; provideOverrides(): void };
                    };
                    dispose(): void;
                }
              | Promise<{
                    dependencies: {
                        balanceAccounts: { getSnapshot(): unknown; subscribe(listener: (snapshot: unknown) => void): () => void };
                        runtime: { getSnapshot(): unknown };
                        translations: { configure(app: { use(plugin: unknown): void }): void; provideOverrides(): void };
                    };
                    dispose(): void;
                }>)
        | undefined,
    integration: { create: vi.fn() },
    translationBinding: {
        i18n: { get: vi.fn() },
        provideBentoOverrides: vi.fn(),
        sync: vi.fn(),
        vueI18n: {},
    },
}));

vi.mock('@integration-components/core', async () => {
    const core = await vi.importActual<typeof import('@integration-components/core')>('@integration-components/core');
    return { ...core, createConfigController: vi.fn() };
});

vi.mock('@integration-components/core/vue/translationBinding', () => ({
    createDomainTranslationVueBinding: vi.fn(() => mocks.translationBinding),
}));

vi.mock('@integration-components/domain-integration', () => ({
    bindDomainComponent: vi.fn((_definition, bindDependencies) => {
        mocks.bindDependencies = bindDependencies;
        return mocks.integration;
    }),
}));

vi.mock('@integration-components/reports/vue/definitions', () => ({
    ReportsOverviewDefinition: {},
}));

describe('bindReportsOverview', () => {
    test('owns Core translation stitching and cleanup in the SDK', async () => {
        const unsubscribeTranslations = vi.fn();
        const disposeConnection = vi.fn();
        let translationListener: ((inputs: { locale?: string }) => void) | undefined;
        const connection = {
            dispose: disposeConnection,
            translations: {
                getInputs: vi.fn(() => ({ locale: 'en-US' })),
                subscribe: vi.fn(listener => {
                    translationListener = listener;
                    return unsubscribeTranslations;
                }),
            },
        };
        const configController = {
            connect: vi.fn(),
            getSnapshot: vi.fn(() => ({
                contextValue: { endpoints: {}, refreshing: false },
                hasPermission: true,
            })),
        };
        const core = {
            connectDomainTranslations: vi.fn(() => connection),
            i18n: {
                amount: vi.fn(),
                date: vi.fn(),
                fullDate: vi.fn(),
                ready: Promise.resolve(),
            },
            session: {},
        };
        vi.mocked(createConfigController).mockReturnValue(configController as never);

        expect(bindReportsOverview(core as never)).toBe(mocks.integration);

        const binding = await mocks.bindDependencies!({ signal: new AbortController().signal });
        const app = { use: vi.fn() };
        binding.dependencies.translations.configure(app);
        binding.dependencies.translations.provideOverrides();
        translationListener?.({ locale: 'fr-FR' });
        await vi.waitFor(() => expect(mocks.translationBinding.sync).toHaveBeenCalledWith({ locale: 'fr-FR' }));
        binding.dispose();

        expect(core.connectDomainTranslations).toHaveBeenCalledWith('reports', expect.any(AbortSignal));
        expect(createDomainTranslationVueBinding).toHaveBeenCalledWith(
            expect.objectContaining({
                inputs: { locale: 'en-US' },
                localSources: expect.objectContaining({ 'en-US': REPORTS_EN_US }),
            })
        );
        expect(app.use).toHaveBeenCalledWith(mocks.translationBinding.vueI18n);
        expect(mocks.translationBinding.provideBentoOverrides).toHaveBeenCalledOnce();
        expect(unsubscribeTranslations).toHaveBeenCalledOnce();
        expect(disposeConnection).toHaveBeenCalledOnce();
    });
});
