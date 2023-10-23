import Localization from '@src/core/Localization';
import { SupportedLocale } from '@src/core/Localization/types';
import { Scope, ScopeTree } from '@src/utils/scope/types';
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
    _translations: TranslationsScopeData['translations'];
    _trash: {
        (): void;
        readonly refresh: TranslationsManager['load'];
    };
};

export type OverrideCallable<T extends (...args: any[]) => any, ReturnValue = ReturnType<T>> = (...args: Parameters<T>) => ReturnValue;
