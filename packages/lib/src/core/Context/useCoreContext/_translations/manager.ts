import Localization from '@src/core/Localization';
import { noop, struct } from '@src/utils/common';
import { createScopeTree } from '@src/utils/scope';
import { Scope } from '@src/utils/scope/types';
import { TranslationKey, TranslationOptions } from '@src/core/Localization/types';
import { I18N_EXCLUDED_PROPS } from './constants';
import { OverrideCallable, Translations, TranslationsLoader, TranslationsScopeData, TranslationsScopeTree } from './types';

export default class TranslationsManager {
    #current!: Scope<TranslationsScopeData>;
    #translationsCache = new WeakMap<TranslationsLoader, Promise<Translations>>();
    #translationsChain: TranslationsScopeTree = createScopeTree();
    #translationsChainResetter = noop;

    readonly #i18n: Localization['i18n'];

    readonly #modifiedI18n: {
        get: OverrideCallable<TranslationsManager['get']>;
        load: TranslationsManager['load'];
    } & Omit<Localization['i18n'], (typeof I18N_EXCLUDED_PROPS)[number]>;

    constructor(i18n: Localization['i18n'] = new Localization().i18n) {
        let { locale } = i18n;

        this.#modifiedI18n = (() => {
            const { get, load } = Object.getOwnPropertyDescriptors(TranslationsManager.prototype);
            const {
                customTranslations,
                get: _get,
                lastRefreshTimestamp,
                ready,
                translations,
                watch,
                ...restDescriptors
            } = Object.getOwnPropertyDescriptors(i18n);
            const __get__ = (get.value as NonNullable<typeof get.value>).bind(this);

            load.value = (load.value as NonNullable<typeof load.value>).bind(this);

            get.value = ((...args) => {
                return __get__(...args);
            }) as TranslationsManager['i18n']['get'];

            return struct({ ...restDescriptors, get, load }) as TranslationsManager['i18n'];
        })();

        (this.#i18n = i18n).watch(() => {
            if (locale !== i18n.locale) {
                locale = i18n.locale;
                this.#translationsCache = new WeakMap();
            }
            this.#translationsChainReset();
        });
    }

    get i18n() {
        return this.#modifiedI18n;
    }

    #translationsChainReset() {
        this.#translationsChainResetter();
        const rootScopeHandle = this.#translationsChain.add({ translations: this.#i18n.translations });
        this.#translationsChainResetter = rootScopeHandle.detach.bind(void 0, false);
        this.#current = rootScopeHandle._scope;
    }

    get(key: TranslationKey, options?: TranslationOptions): string {
        for (const scope of this.#translationsChain.trace(this.#current)) {
            let translations = scope?.data?.translations;
            if (!translations) continue;
            const translation = this.#i18n.get(key, options, translations);
            if (!(translation === null || translation === key)) return translation;
        }

        return key;
    }

    load(loadTranslations: TranslationsLoader, doneCallback?: (err: Error | null) => any): ReturnType<TranslationsScopeTree['add']> {
        if (typeof loadTranslations !== 'function') throw new TypeError('Function required to load translations');

        let translations = {} as Translations;

        const promise = this.#translationsCache.get(loadTranslations);
        const translationsPromise = promise ?? (async () => ({ ...(await loadTranslations(this.#i18n.locale)) }))();

        const scopeHandle = this.#translationsChain.add(
            {
                get translations() {
                    return translations;
                },
            },
            this.#current
        );

        if (promise === undefined) this.#translationsCache.set(loadTranslations, translationsPromise);

        translationsPromise
            .then(value => {
                translations = value;
                doneCallback?.(null);
            })
            .catch(reason => {
                scopeHandle.detach(true);
                if (import.meta.env.DEV) console.error(reason);
                doneCallback?.(new Error('No available translations'));
            });

        this.#current = scopeHandle._scope;
        return scopeHandle;
    }
}
