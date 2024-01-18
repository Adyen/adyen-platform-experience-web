import CURRENCY_CODES from './constants/currency-codes';
import CURRENCY_DECIMALS from './constants/currency-decimals';
import { SUPPORTED_LOCALES } from '../Localization/constants/localization';
import type { ReplaceUnderscoreOrDash } from '@src/utils/types';
import { en_US } from '@src/core';

export type CurrencyCode = keyof typeof CURRENCY_CODES;
export type CurrencyDecimalCode = keyof typeof CURRENCY_DECIMALS;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type SupportedLocaleFiles = ReplaceUnderscoreOrDash<SupportedLocale, '-', '_'>;

export type LangFile = {
    [K in SupportedLocaleFiles]: {
        [P in K]: Translation;
    };
}[SupportedLocaleFiles];

export type TranslationKey = keyof (typeof en_US)['en_US'];

export type TranslationOptions = {
    values?: Record<string, string | number>;
    count?: number;
};

export type Translation = {
    [message: string]: string;
};

export type CustomTranslations = {
    [key: string]: {
        [message in TranslationKey]?: string;
    };
};

export type Restamp = {
    (): RestampResult;
    (time?: string | number | Date): RestampResult;
    // [TODO]: Remove the following @ts-ignore directive after TS version has been bumped up to >=5.0.0.
    // @ts-ignore
    get tz(): {
        get current(): string | undefined;
        set current(timezone: string | undefined | null);
        readonly system: string | undefined;
    };
    set tz(timezone: string | undefined | null);
};

export type RestampContext = {
    TIMEZONE: Restamp['tz']['current'];
    formatter?: Intl.DateTimeFormat;
};

export type RestampResult = Readonly<{
    formatted: string | undefined;
    offsets: readonly [number, number];
    timestamp: number;
}>;
