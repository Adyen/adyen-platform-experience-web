import EN_US from './en-US.json' with { type: 'json' };

export type PayoutsTranslationKey = keyof typeof EN_US;
export type PayoutsTranslationSource = Readonly<Partial<Record<PayoutsTranslationKey, string>>>;
export type PayoutsTranslationLocale = keyof typeof PAYOUTS_TRANSLATION_LOADERS;

export const PAYOUTS_EN_US = EN_US satisfies PayoutsTranslationSource;

export const PAYOUTS_TRANSLATION_LOADERS = {
    'da-DK': () => import('./da-DK.json', { with: { type: 'json' } }).then(module => module.default),
    'de-DE': () => import('./de-DE.json', { with: { type: 'json' } }).then(module => module.default),
    'en-US': () => Promise.resolve(PAYOUTS_EN_US),
    'es-ES': () => import('./es-ES.json', { with: { type: 'json' } }).then(module => module.default),
    'fi-FI': () => import('./fi-FI.json', { with: { type: 'json' } }).then(module => module.default),
    'fr-FR': () => import('./fr-FR.json', { with: { type: 'json' } }).then(module => module.default),
    'it-IT': () => import('./it-IT.json', { with: { type: 'json' } }).then(module => module.default),
    'nl-NL': () => import('./nl-NL.json', { with: { type: 'json' } }).then(module => module.default),
    'no-NO': () => import('./no-NO.json', { with: { type: 'json' } }).then(module => module.default),
    'pt-BR': () => import('./pt-BR.json', { with: { type: 'json' } }).then(module => module.default),
    'sv-SE': () => import('./sv-SE.json', { with: { type: 'json' } }).then(module => module.default),
} as const satisfies Readonly<Record<string, () => Promise<PayoutsTranslationSource>>>;

export const PAYOUTS_PROTECTED_TRANSLATION_KEYS: ReadonlySet<PayoutsTranslationKey> = new Set();

const PAYOUTS_TRANSLATION_KEYS = new Set<string>(Object.keys(PAYOUTS_EN_US));

export const isPayoutsTranslationKey = (key: string): key is PayoutsTranslationKey => PAYOUTS_TRANSLATION_KEYS.has(key);
