import { V2_ROUTED_BENTO_TRANSLATION_KEYS, type DomainI18n, type DomainTranslationInputs, type V2BentoTranslationKey } from '../translation-contract';
import { createDomainTranslationVueBinding } from './translationBinding';
import type { CoreInstance } from './types';
import type { App } from 'vue';

type TranslationSource = Readonly<Record<string, string>>;

type DomainTranslations<Key extends string> = Readonly<{
    configure(app: App): void;
    i18n: DomainI18n<Key>;
    provideOverrides(): void;
}>;

type CreateDomainTranslationsOptions<Key extends string, Locale extends string> = Readonly<{
    core: CoreInstance;
    domain: string;
    loaders: Readonly<Record<Locale, () => Promise<TranslationSource>>>;
    protectedKeys: ReadonlySet<Key>;
    signal: AbortSignal;
    source: TranslationSource;
}>;

export const createDomainTranslations = async <Key extends string, Locale extends string>({
    core,
    domain,
    loaders,
    protectedKeys,
    signal,
    source,
}: CreateDomainTranslationsOptions<Key, Locale>): Promise<Readonly<{ dispose(): void; translations: DomainTranslations<Key> }>> => {
    type TranslationKey = Key | V2BentoTranslationKey;
    const connection = core.connectDomainTranslations<TranslationKey>(domain, signal);
    const inputs = connection.translations.getInputs();
    const localSources: Record<string, TranslationSource> = {};
    const loadSource = (locale: string | undefined): Promise<TranslationSource | undefined> => {
        if (!locale || !Object.hasOwn(loaders, locale)) return Promise.resolve(undefined);
        return loaders[locale as Locale]();
    };
    const initialSource = await loadSource(inputs.locale).catch(() => undefined);
    if (signal.aborted) {
        connection.dispose();
        throw signal.reason;
    }
    if (inputs.locale && initialSource) localSources[inputs.locale] = initialSource;
    const binding = createDomainTranslationVueBinding<TranslationKey>({
        formatters: {
            amount: (amount, currencyCode, options) => core.i18n.amount(amount, currencyCode, options),
            date: (date, options) => core.i18n.date(date, options),
            fullDate: date => core.i18n.fullDate(date),
            ready: core.i18n.ready,
            timezone: core.i18n.timezone,
        },
        inputs,
        localSources,
        protectedKeys,
        source,
        universalKeys: V2_ROUTED_BENTO_TRANSLATION_KEYS,
    });
    let syncVersion = 0;
    const sync = async (nextInputs: DomainTranslationInputs<TranslationKey>) => {
        const version = ++syncVersion;
        const nextSource = await loadSource(nextInputs.locale).catch(() => undefined);
        if (version !== syncVersion || signal.aborted) return;
        if (nextInputs.locale && nextSource) localSources[nextInputs.locale] = nextSource;
        binding.sync(nextInputs);
    };
    const unsubscribe = connection.translations.subscribe(nextInputs => void sync(nextInputs));

    // The core only notifies already-subscribed listeners, so inputs that changed while the
    // initial source was loading (before subscribe() was registered) are never pushed here.
    // getInputs() is a live poll: re-read it once after subscribing and reconcile if it moved.
    const latestInputs = connection.translations.getInputs();
    if (latestInputs.locale !== inputs.locale || latestInputs.getCustomTranslations !== inputs.getCustomTranslations) {
        void sync(latestInputs);
    }

    return {
        dispose: () => {
            syncVersion++;
            unsubscribe();
            connection.dispose();
        },
        translations: {
            configure: app => {
                app.use(binding.vueI18n);
            },
            i18n: binding.i18n as DomainI18n<Key>,
            provideOverrides: () => binding.provideBentoOverrides(),
        },
    };
};
