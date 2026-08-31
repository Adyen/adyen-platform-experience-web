import EN_US from './en-US.json' with { type: 'json' };

export type PayByLinkTranslationKey = keyof typeof EN_US;
export type PayByLinkTranslationSource = Readonly<Partial<Record<PayByLinkTranslationKey, string>>>;
export type PayByLinkTranslationLocale = keyof typeof PAY_BY_LINK_TRANSLATION_LOADERS;

export const PAY_BY_LINK_EN_US = EN_US satisfies PayByLinkTranslationSource;

export const PAY_BY_LINK_TRANSLATION_LOADERS = {
    'da-DK': () => import('./da-DK.json', { with: { type: 'json' } }).then(module => module.default),
    'de-DE': () => import('./de-DE.json', { with: { type: 'json' } }).then(module => module.default),
    'en-US': () => Promise.resolve(PAY_BY_LINK_EN_US),
    'es-ES': () => import('./es-ES.json', { with: { type: 'json' } }).then(module => module.default),
    'fi-FI': () => import('./fi-FI.json', { with: { type: 'json' } }).then(module => module.default),
    'fr-FR': () => import('./fr-FR.json', { with: { type: 'json' } }).then(module => module.default),
    'it-IT': () => import('./it-IT.json', { with: { type: 'json' } }).then(module => module.default),
    'nl-NL': () => import('./nl-NL.json', { with: { type: 'json' } }).then(module => module.default),
    'no-NO': () => import('./no-NO.json', { with: { type: 'json' } }).then(module => module.default),
    'pt-BR': () => import('./pt-BR.json', { with: { type: 'json' } }).then(module => module.default),
    'sv-SE': () => import('./sv-SE.json', { with: { type: 'json' } }).then(module => module.default),
} as const satisfies Readonly<Record<string, () => Promise<PayByLinkTranslationSource>>>;

export const PAY_BY_LINK_PROTECTED_TRANSLATION_KEYS: ReadonlySet<PayByLinkTranslationKey> = new Set();

const PAY_BY_LINK_TRANSLATION_KEYS = new Set<string>(Object.keys(PAY_BY_LINK_EN_US));

export const isPayByLinkTranslationKey = (key: string): key is PayByLinkTranslationKey => PAY_BY_LINK_TRANSLATION_KEYS.has(key);
