import { DevEnvironment } from './types';

export const FALLBACK_ENV = 'test' satisfies DevEnvironment;
export const normalizeLoadingContext = (loadingContext: string) => loadingContext?.replace?.(/([^\/])$/, '$1/')!;
export const normalizeUrl = (url: string) => url?.replace(/^([^\/])/, '/$1')!;

export const resolveEnvironment = (() => {
    // [TODO]: Use real urls once we have our BFF defined.
    const envs: Partial<Record<DevEnvironment, string>> = {
        test: 'https://platform-components-external-test.adyen.com/platform-components-external/api/',
        live: 'https://platform-components-external-live.adyen.com/platform-components-external/api/',
    };

    return (env?: DevEnvironment) => envs[env ?? FALLBACK_ENV] || envs[FALLBACK_ENV]!;
})();
