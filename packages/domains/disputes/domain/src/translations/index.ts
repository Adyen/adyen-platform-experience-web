import EN_US from './en-US.json' with { type: 'json' };

export type DisputesTranslationKey = keyof typeof EN_US;
export type DisputesTranslationSource = Readonly<Partial<Record<DisputesTranslationKey, string>>>;
export type DisputesTranslationLocale = keyof typeof DISPUTES_TRANSLATION_LOADERS;

export const DISPUTES_EN_US = EN_US satisfies DisputesTranslationSource;

export const DISPUTES_TRANSLATION_LOADERS = {
    'da-DK': () => import('./da-DK.json', { with: { type: 'json' } }).then(module => module.default),
    'de-DE': () => import('./de-DE.json', { with: { type: 'json' } }).then(module => module.default),
    'en-US': () => Promise.resolve(DISPUTES_EN_US),
    'es-ES': () => import('./es-ES.json', { with: { type: 'json' } }).then(module => module.default),
    'fi-FI': () => import('./fi-FI.json', { with: { type: 'json' } }).then(module => module.default),
    'fr-FR': () => import('./fr-FR.json', { with: { type: 'json' } }).then(module => module.default),
    'it-IT': () => import('./it-IT.json', { with: { type: 'json' } }).then(module => module.default),
    'nl-NL': () => import('./nl-NL.json', { with: { type: 'json' } }).then(module => module.default),
    'no-NO': () => import('./no-NO.json', { with: { type: 'json' } }).then(module => module.default),
    'pt-BR': () => import('./pt-BR.json', { with: { type: 'json' } }).then(module => module.default),
    'sv-SE': () => import('./sv-SE.json', { with: { type: 'json' } }).then(module => module.default),
} as const satisfies Readonly<Record<string, () => Promise<DisputesTranslationSource>>>;

// Protected legal and compliance copy will be added after domain-owner approval.
export const DISPUTES_PROTECTED_TRANSLATION_KEYS: ReadonlySet<DisputesTranslationKey> = new Set();

const DISPUTES_TRANSLATION_KEYS = new Set<string>(Object.keys(DISPUTES_EN_US));

export const isDisputesTranslationKey = (key: string): key is DisputesTranslationKey => DISPUTES_TRANSLATION_KEYS.has(key);
