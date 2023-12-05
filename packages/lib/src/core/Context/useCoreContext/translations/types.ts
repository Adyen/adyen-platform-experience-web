import Localization from '@src/core/Localization';
import { SupportedLocale } from '@src/core/Localization/types';
import { Scope, ScopeTree } from '@src/utils/scope/types';
import { I18N_EXCLUDED_PROPS } from './constants';
import TranslationsManager from './manager';

type Promised<T> = Promise<T> | T;

export type Translations = Record<string, string>;
export type TranslationsLoader = (locale: SupportedLocale | string) => Promised<Translations>;
export type TranslationsScopeTree = ScopeTree<TranslationsScopeData>;

export type TranslationsScopeData = {
    _source: Scope<TranslationsScopeData>;
    translations: Translations;
};

export type TranslationsScopeRecord = {
    _done?: (...args: any[]) => any;
    _lastPromise?: Promise<Translations>;
    _load?: TranslationsLoader;
    _locale: Localization['locale'];
    _prev: Scope<TranslationsScopeData>;
    _translations: TranslationsScopeData['translations'];
    _trash: {
        (): void;
        readonly refresh: TranslationsManager['load'];
    };
};

type OverrideCallable<T extends (...args: any[]) => any, ReturnValue = ReturnType<T>> = (...args: Parameters<T>) => ReturnValue;

export type TranslationsManagerI18n = {
    get: OverrideCallable<TranslationsManager['get']>;
} & Omit<Localization['i18n'], (typeof I18N_EXCLUDED_PROPS)[number]>;

export type TranslationsContextThisBinding = Pick<TranslationsManager, 'load' | 'reset'> & {
    /**
     * @todo
     *   Change the `i18n` parameter type from the union (`Localization['i18n'] | TranslationsManagerI18n`) to just
     *   `Localization['i18n']` — when this package's TypeScript version has been bumped up to at least 5.1, which
     *   supports [unrelated types for getters and setters](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-1.html#unrelated-types-for-getters-and-setters).
     */
    set i18n(i18n: Localization['i18n'] | TranslationsManager['i18n']);
    get i18n(): TranslationsManager['i18n'];
};

export type UseTranslationsOptions = {
    customTranslations?: Record<string, Awaited<ReturnType<TranslationsLoader>>>;
    translations?: Record<string, Awaited<ReturnType<TranslationsLoader>> | (() => ReturnType<TranslationsLoader>)>;
};

export type WithTranslationsI18n<T extends { i18n?: any }> = Omit<T, 'i18n'> & Pick<TranslationsManager, 'i18n'>;
