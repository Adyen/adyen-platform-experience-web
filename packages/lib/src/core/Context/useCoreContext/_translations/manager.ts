import Localization from '@src/core/Localization';
import { EMPTY_OBJECT, noop, struct } from '@src/utils/common';
import { createScopeTree } from '@src/utils/scope';
import { Scope } from '@src/utils/scope/types';
import { TranslationKey, TranslationOptions } from '@src/core/Localization/types';
import { I18N_EXCLUDED_PROPS } from './constants';
import { OverrideCallable, TranslationsLoader, TranslationsScopeData, TranslationsScopeRecord, TranslationsScopeTree } from './types';

export default class TranslationsManager {
    #current!: Scope<TranslationsScopeData>;
    #translationsScopeMap = new WeakMap<NonNullable<Scope<TranslationsScopeData>>, TranslationsScopeRecord>();
    #translationsTree: TranslationsScopeTree = createScopeTree();
    #translationsTreeResetter = noop;

    readonly #i18n: Localization['i18n'];

    readonly #modifiedI18n: {
        get: OverrideCallable<TranslationsManager['get']>;
        load: TranslationsManager['load'];
    } & Omit<Localization['i18n'], (typeof I18N_EXCLUDED_PROPS)[number]>;

    constructor(i18n: Localization['i18n'] = new Localization().i18n) {
        this.#i18n = i18n;

        this.#modifiedI18n = (() => {
            const {
                customTranslations,
                get: _get,
                lastRefreshTimestamp,
                ready,
                translations,
                watch,
                ...restDescriptors
            } = Object.getOwnPropertyDescriptors(i18n);

            const { get, load } = Object.getOwnPropertyDescriptors(TranslationsManager.prototype);
            const __get__ = (get.value as NonNullable<typeof get.value>).bind(this);

            load.value = (load.value as NonNullable<typeof load.value>).bind(this);

            get.value = ((...args) => {
                return __get__(...args);
            }) as TranslationsManager['i18n']['get'];

            return struct({ ...restDescriptors, get, load }) as TranslationsManager['i18n'];
        })();

        const rootScopeHandle = this.#translationsTree.add({ _source: null, translations: i18n.translations });
        this.#translationsTreeResetter = rootScopeHandle.detach.bind(void 0, false);
        this.#current = rootScopeHandle._scope;
    }

    get erase() {
        return this.#translationsTreeResetter;
    }

    get i18n() {
        return this.#modifiedI18n;
    }

    #initializeTranslationsScope(loadTranslations?: TranslationsLoader, doneCallback?: () => any) {
        let _source: TranslationsScopeData['_source'] = null;

        const { _scope, detach } = this.#translationsTree.add(
            struct({
                _source: {
                    get: () => _source,
                    set: (source: typeof _source) => {
                        if (source || source === null) _source = source;
                    },
                },
                translations: {
                    get: () => record._translations,
                    set: (translations: typeof record._translations) => {
                        record._translations = translations;
                    },
                },
            }),
            this.#current
        );

        const _trash = (() => {
            detach(false);
            if (_scope?.data) {
                // Destroy possible reference pointers down the tree from this scope to avoid potential memory leaks
                _scope.data._source = _scope.data.translations = undefined as unknown as any;
                this.#translationsScopeMap.delete(_scope);
            }
        }) as TranslationsScopeRecord['_trash'];

        const record: TranslationsScopeRecord = {
            _done: doneCallback,
            _load: loadTranslations,
            _locale: this.#i18n.locale,
            _translations: EMPTY_OBJECT,
            _trash: Object.defineProperties(_trash, {
                refresh: { value: this.#refreshTranslationsScopeIfNecessary.bind(this, void 0, _scope) },
            }),
        };

        this.#translationsScopeMap.set(_scope, record);
        return _scope;
    }

    #refreshTranslationsScopeIfNecessary(
        _internalFreshScopeToken: any,
        scope: NonNullable<Scope<TranslationsScopeData>>,
        loadTranslations?: TranslationsLoader,
        doneCallback?: () => any
    ) {
        // [TODO]: Update this.#current somewhere in this block
        const record = this.#translationsScopeMap.get(scope)!;
        const locale = this.#i18n.locale;

        loading: if (typeof loadTranslations === 'function') {
            if (loadTranslations === record._load && locale === record._locale) break loading;

            const translationsPromise = (async () => ({ ...(await loadTranslations(locale)) }))();

            translationsPromise
                .then(value => {
                    if (translationsPromise !== record._lastPromise) return;
                    record._translations = value;
                    record._done?.();
                })
                .catch(reason => {
                    if (translationsPromise !== record._lastPromise) return;
                    if (import.meta.env.DEV) console.error(reason);
                    scope.data._source = scope.prev?.data._source ?? scope.prev;
                    record._done?.();
                });

            record._lastPromise = translationsPromise;
        } else {
            // [TODO]: Scope is no longer a translations scope (remap descendants)
            console.log('noop...');
        }

        record._done = doneCallback;
        record._load = loadTranslations;
        record._locale = locale;

        return record._trash;
    }

    get(key: TranslationKey, options?: TranslationOptions): string {
        let current!: ReturnType<(typeof chain)['next']>;
        let originScopeSource!: Scope<TranslationsScopeData>;

        const chain = this.#translationsTree.trace(this.#current);
        const originScope = (current = chain.next()).value;

        while (!current.done) {
            const scope = current.value;
            const scopeData = scope?.data;

            if (scopeData) {
                if (scopeData._source) {
                    current = chain.next(scopeData._source);
                    continue;
                } else if (originScope && originScopeSource === undefined) {
                    originScope === scope ? (originScopeSource = null) : (originScope.data._source = originScopeSource = scope);
                }

                const translation = this.#i18n.get(key, options, scopeData.translations);

                if (!(translation === null || translation === key)) {
                    return translation;
                }
            }

            current = chain.next();
        }

        return key;
    }

    load(loadTranslations?: TranslationsLoader, doneCallback?: () => any) {
        const _scope = this.#initializeTranslationsScope();
        if (typeof loadTranslations === 'function') this.#current = _scope;
        return this.#refreshTranslationsScopeIfNecessary(EMPTY_OBJECT, _scope, loadTranslations, doneCallback);
    }

    swap(i18n: Localization['i18n']) {
        // [TODO]: Implement i18n swapping
        return this;
    }
}
