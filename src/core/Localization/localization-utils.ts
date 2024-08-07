import { CustomTranslations, SupportedLocale } from './types';
import { formatLocale, loadTranslations, parseLocale } from './utils';
import { FALLBACK_LOCALE } from './constants/locale';
import { EXCLUDE_PROPS } from './constants/localization';
import { isFunction, struct } from '../../utils';
import Localization from './Localization';

export function createTranslationsLoader(this: Localization) {
    type TranslationsLoader = {
        load: (customTranslations?: CustomTranslations) => ReturnType<typeof loadTranslations>;
        locale: SupportedLocale | string;
        supportedLocales: (SupportedLocale | string)[];
    };

    let _locale = this.locale;
    let _preferredLocale = _locale;
    let _supportedLocales: TranslationsLoader['supportedLocales'] = [...this.supportedLocales];

    return struct<TranslationsLoader>({
        load: { value: (customTranslations?: CustomTranslations) => loadTranslations(_locale, this.preferredTranslations, customTranslations) },
        locale: {
            get: () => _locale,
            set: (locale: SupportedLocale | string) => {
                _preferredLocale = locale;
                _locale = formatLocale(locale) || parseLocale(locale, _supportedLocales) || FALLBACK_LOCALE;
            },
        },
        supportedLocales: {
            get: () => _supportedLocales,
            set(this: TranslationsLoader, supportedLocales: (SupportedLocale | string)[]) {
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
