import { SupportedLocale } from '@src/core/Localization/types';
import { ScopeTree } from '@src/utils/scope/types';

type Promised<T> = Promise<T> | T;

export type Translations = Record<string, string>;
export type TranslationsLoader = (locale: SupportedLocale | string) => Promised<Translations>;
export type TranslationsScopeData = { readonly translations: Translations };
export type TranslationsScopeTree = ScopeTree<TranslationsScopeData>;

export type OverrideCallable<T extends (...args: any[]) => any, ReturnValue = ReturnType<T>> = (...args: Parameters<T>) => ReturnValue;
