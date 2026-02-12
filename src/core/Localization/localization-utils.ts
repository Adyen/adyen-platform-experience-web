import Localization from './Localization';
import { isFunction, struct } from '../../utils';
import { formatLocale, loadTranslations, parseLocale } from './utils';
import { EXCLUDE_PROPS, FALLBACK_LOCALE } from './constants/localization';
import type { CustomTranslations, Locale } from '../../translations';
import { SupportedLocales } from './types';

export function createTranslationsLoader(this: Localization) {
    type TranslationsLoader = {
        load: (
            fetchTranslationFromCdnPromise: (locale: SupportedLocales) => Promise<any>,
            customTranslations?: CustomTranslations
        ) => ReturnType<typeof loadTranslations>;
        get locale(): Locale;
        set locale(locale: string);
        supportedLocales: Locale[];
    };

    let _locale = this.locale;
    let _preferredLocale: string = _locale;
    let _supportedLocales: TranslationsLoader['supportedLocales'] = [...this.supportedLocales];

    return struct<TranslationsLoader>({
        load: {
            value: (fetchTranslationFromCdnPromise: (locale: SupportedLocales) => Promise<any>, customTranslations?: CustomTranslations) =>
                loadTranslations(_locale, fetchTranslationFromCdnPromise, customTranslations),
        },
        locale: {
            get: () => _locale,
            set: (locale: string) => {
                _preferredLocale = locale;
                _locale = formatLocale(locale) || parseLocale(locale, _supportedLocales) || FALLBACK_LOCALE;
            },
        },
        supportedLocales: {
            get: () => _supportedLocales,
            set(this: TranslationsLoader, supportedLocales: Locale[]) {
                _supportedLocales = supportedLocales;
                this.locale = _preferredLocale;
            },
        },
    });
}

export function getLocalizationProxyDescriptors(this: Localization) {
    const descriptors = {} as any;

    for (const [prop, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(Localization.prototype))) {
        if (EXCLUDE_PROPS.includes(prop as (typeof EXCLUDE_PROPS)[number])) continue;

        if (isFunction(descriptor.get)) {
            descriptors[prop] = {
                get: descriptor.get.bind(this),
                ...(prop === 'timezone' && { set: descriptor.set?.bind(this) }),
            };
        } else if (isFunction(descriptor.value)) {
            descriptors[prop] = { value: descriptor.value.bind(this) };
        } else {
            descriptors[prop] = { get: () => this[prop as keyof Localization] };
        }
    }

    return descriptors as { [K in keyof Localization['i18n']]: PropertyDescriptor };
}
