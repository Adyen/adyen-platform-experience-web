import CURRENCY_CODES from './constants/currency-codes';
import CURRENCY_DECIMALS from './constants/currency-decimals';
import translations from './translations';
import { ScopeChain } from '@src/utils/scope/types';
import { Watchable } from '@src/utils/watchable/types';

type ExtractReturnType<T> = T extends () => Promise<infer U> ? U : never;

export type CurrencyCode = keyof typeof CURRENCY_CODES;
export type CurrencyDecimalCode = keyof typeof CURRENCY_DECIMALS;
export type SupportedLocale = keyof typeof translations;

export type TranslationKey = keyof ExtractReturnType<(typeof translations)['en-US']>;

type Promised<T> = Promise<T> | T;

export type Translations = Record<string, string>;
export type TranslationsLoader = (locale: SupportedLocale | string) => Promised<Translations>;
export type TranslationsScopeData = { readonly translations: Translations };
export type TranslationsScopeChain = ScopeChain<TranslationsScopeData>;

export type TranslationsRefreshWatchable = Watchable<{ timestamp: number }>;
export type TranslationsRefreshWatchCallback = NonNullable<Parameters<TranslationsRefreshWatchable['watch']>[0]>;

export type TranslationOptions = {
    values?: Record<string, string | number>;
    count?: number;
};

export type CustomTranslations = {
    [key: string]: {
        [message in TranslationKey]?: string;
    };
};

export type Restamp = {
    (): number;
    (time?: string | number | Date): number;
    get tz(): string | undefined;
    set tz(timezone: string | undefined | null);
};

export type RestampContext = {
    TIMEZONE: Restamp['tz'];
    formatter?: Intl.DateTimeFormat;
};
