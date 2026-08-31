import EN_US from './en-US.json' with { type: 'json' };

export type TransactionsTranslationKey = keyof typeof EN_US;
export type TransactionsTranslationSource = Readonly<Partial<Record<TransactionsTranslationKey, string>>>;
export type TransactionsTranslationLocale = keyof typeof TRANSACTIONS_TRANSLATION_LOADERS;

export const TRANSACTIONS_EN_US = EN_US satisfies TransactionsTranslationSource;

export const TRANSACTIONS_TRANSLATION_LOADERS = {
    'da-DK': () => import('./da-DK.json', { with: { type: 'json' } }).then(module => module.default),
    'de-DE': () => import('./de-DE.json', { with: { type: 'json' } }).then(module => module.default),
    'en-US': () => Promise.resolve(TRANSACTIONS_EN_US),
    'es-ES': () => import('./es-ES.json', { with: { type: 'json' } }).then(module => module.default),
    'fi-FI': () => import('./fi-FI.json', { with: { type: 'json' } }).then(module => module.default),
    'fr-FR': () => import('./fr-FR.json', { with: { type: 'json' } }).then(module => module.default),
    'it-IT': () => import('./it-IT.json', { with: { type: 'json' } }).then(module => module.default),
    'nl-NL': () => import('./nl-NL.json', { with: { type: 'json' } }).then(module => module.default),
    'no-NO': () => import('./no-NO.json', { with: { type: 'json' } }).then(module => module.default),
    'pt-BR': () => import('./pt-BR.json', { with: { type: 'json' } }).then(module => module.default),
    'sv-SE': () => import('./sv-SE.json', { with: { type: 'json' } }).then(module => module.default),
} as const satisfies Readonly<Record<string, () => Promise<TransactionsTranslationSource>>>;

export const TRANSACTIONS_PROTECTED_TRANSLATION_KEYS: ReadonlySet<TransactionsTranslationKey> = new Set();

const TRANSACTIONS_TRANSLATION_KEYS = new Set<string>(Object.keys(TRANSACTIONS_EN_US));

export const isTransactionsTranslationKey = (key: string): key is TransactionsTranslationKey => TRANSACTIONS_TRANSLATION_KEYS.has(key);
