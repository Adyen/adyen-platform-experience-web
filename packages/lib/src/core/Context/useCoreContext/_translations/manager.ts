import { options } from 'preact';
import Localization from '@src/core/Localization';
import { EMPTY_OBJECT, noop, struct } from '@src/utils/common';
import { createScopeTree } from '@src/utils/scope';
import { Scope } from '@src/utils/scope/types';
import { TranslationKey, TranslationOptions } from '@src/core/Localization/types';
import { TranslationsLoader, TranslationsManagerI18n, TranslationsScopeData, TranslationsScopeRecord, TranslationsScopeTree } from './types';

export default class TranslationsManager {
    #i18n!: Localization['i18n'];
    #current!: Scope<TranslationsScopeData>;
    #modifiedI18n!: TranslationsManagerI18n;

    readonly #translationsScopesMap = new WeakMap<NonNullable<Scope<TranslationsScopeData>>, TranslationsScopeRecord>();
    readonly #translationsTree: TranslationsScopeTree = createScopeTree();
    readonly #translationsTreeResetter = noop;

    constructor(i18n: Localization['i18n'] = new Localization().i18n) {
        this.i18n = i18n;

        const rootScopeHandle = this.#translationsTree.add(
            struct({
                _source: { value: null },
                translations: { get: () => this.#i18n.translations },
            })
        );

        this.#translationsTreeResetter = rootScopeHandle.detach.bind(void 0, false);
        this.#current = rootScopeHandle._scope;

        const _diffed = options.diffed;
        let currentScope = this.#current!;

        options.diffed = vnode => {
            _diffed?.(vnode);
            if (this.#current && this.#current !== currentScope && this.#current !== rootScopeHandle._scope) {
                const record = this.#translationsScopesMap.get(this.#current)!;
                currentScope = this.#current = record._prev!;
                record._prev = null;
            }
        };
    }

    get erase() {
        return this.#translationsTreeResetter;
    }

    get i18n(): TranslationsManagerI18n {
        return this.#modifiedI18n;
    }

    /**
     * @todo
     *   Change the `i18n` parameter type from the union `Localization['i18n'] | TranslationsManagerI18n` to just
     *   `Localization['i18n']` — when this package's TypeScript version has been bumped up to at least 5.1, which
     *   supports unrelated types for getters and setters (@link https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-1.html#unrelated-types-for-getters-and-setters).
     */
    set i18n(i18n: Localization['i18n'] | TranslationsManagerI18n) {
        this.#useI18n(i18n as any);
    }

    #useI18n(i18n: Localization['i18n']) {
        this.#modifiedI18n = (() => {
            const {
                customTranslations,
                get: _get,
                lastRefreshTimestamp,
                ready,
                translations,
                watch,
                ...restDescriptors
            } = Object.getOwnPropertyDescriptors((this.#i18n = i18n));

            const { get, load } = Object.getOwnPropertyDescriptors(TranslationsManager.prototype);
            const __get__ = (get.value as NonNullable<typeof get.value>).bind(this);

            load.value = (load.value as NonNullable<typeof load.value>).bind(this);

            get.value = ((...args) => {
                return __get__(...args);
            }) as TranslationsManager['i18n']['get'];

            return struct({ ...restDescriptors, get, load }) as TranslationsManager['i18n'];
        })();
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
            const record = this.#translationsScopesMap.get(_scope);

            if (record === undefined) return;

            if (_scope?.data) {
                // Destroy possible reference pointers down the tree from this scope to avoid potential memory leaks
                _scope.data._source = _scope.data.translations = undefined as unknown as any;
            }

            record._prev = null;
            detach(false);
            this.#translationsScopesMap.delete(_scope);
        }) as TranslationsScopeRecord['_trash'];

        const record: TranslationsScopeRecord = {
            _done: doneCallback,
            _load: loadTranslations,
            _locale: this.#i18n.locale,
            _prev: null,
            _translations: EMPTY_OBJECT,
            _trash: Object.defineProperties(_trash, {
                refresh: { value: this.#refreshTranslationsScope.bind(this, _scope) },
            }),
        };

        this.#translationsScopesMap.set(_scope, record);
        return _scope;
    }

    #refreshTranslationsScope(scope: NonNullable<Scope<TranslationsScopeData>>, load?: TranslationsLoader, done?: () => any) {
        const record = this.#translationsScopesMap.get(scope)!;
        const locale = this.#i18n.locale;

        record._prev = this.#current;
        this.#current = scope;

        loading: if (typeof load === 'function') {
            if (load === record._load && locale === record._locale) break loading;

            const translationsPromise = (async () => ({ ...(await load(locale)) }))();

            translationsPromise
                .then(value => {
                    if (translationsPromise !== record._lastPromise) return;
                    scope.data._source = null;
                    record._translations = value;

                    let parent = scope.prev;
                    const ancestors = new Set<NonNullable<Scope<TranslationsScopeData>>>();
                    const stack = [scope];

                    while (parent) {
                        ancestors.add(parent);
                        parent = parent.prev;
                    }

                    while (stack.length) {
                        const _scope = stack.pop();

                        _scope?.next?.forEach(childScope => {
                            const source = childScope.data._source;
                            if (source === null || !ancestors.has(source)) return;
                            childScope.data._source = scope;
                            stack.push(childScope);
                        });
                    }

                    record._done?.();
                })
                .catch(reason => {
                    if (translationsPromise !== record._lastPromise) return;
                    if (import.meta.env.DEV) console.error(reason);
                    scope.data._source = scope.prev?.data._source ?? scope.prev;
                    record._done?.();
                });

            record._lastPromise = translationsPromise;
        } else if (scope.data._source === null) {
            // scope is no longer a source of translations
            scope.data._source = scope.prev?.data._source ?? scope.prev;
            record._translations = EMPTY_OBJECT;
            record._done?.();
        }

        record._done = done;
        record._load = load;
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

    load(load?: TranslationsLoader, done?: () => any) {
        const _scope = this.#initializeTranslationsScope();
        return this.#refreshTranslationsScope(_scope, load, done);
    }
}
