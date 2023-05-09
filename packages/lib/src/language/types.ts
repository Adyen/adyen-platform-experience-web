import translations from './translations';

export type Locales = keyof typeof translations;

export type CustomTranslations = {
    [key: string]: {
        [message: string]: string;
    };
};

export type TranslationOptions = { values?: Record<string, string | number>; count?: number };

type ExtractReturnType<T> = T extends () => Promise<infer U> ? U : never;

export type TranslationKey = keyof ExtractReturnType<(typeof translations)['en-US']>;
