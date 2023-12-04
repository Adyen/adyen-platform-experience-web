import CURRENCY_CODES from './constants/currency-codes';
import CURRENCY_DECIMALS from './constants/currency-decimals';
import { SUPPORTED_LOCALES } from '../Localization/constants/localization';
import { en_US } from '../Localization/translations';
import { ReplaceUnderscoreOrDash } from '../../utils/types';
import { Watchable } from '@src/utils/watchable/types';

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

export type TranslationsRefreshWatchable = Watchable<{ timestamp: number }>;
export type TranslationsRefreshWatchCallback = NonNullable<Parameters<TranslationsRefreshWatchable['watch']>[0]>;

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
