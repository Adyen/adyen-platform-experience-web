import CURRENCY_CODES from './constants/currency-codes';
import CURRENCY_DECIMALS from './constants/currency-decimals';
import { SUPPORTED_LOCALES } from '../Localization/constants/localization';
import { en_US } from '../Localization/translations';

type ExtractReturnType<T> = T extends () => Promise<infer U> ? U : never;

export type CurrencyCode = keyof typeof CURRENCY_CODES;
export type CurrencyDecimalCode = keyof typeof CURRENCY_DECIMALS;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type TranslationKey = keyof typeof en_US;

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
    (): number;
    (time?: string | number | Date): number;
    get tz(): string | undefined;
    set tz(timezone: string | undefined | null);
};

export type RestampContext = {
    TIMEZONE: Restamp['tz'];
    formatter?: Intl.DateTimeFormat;
};
