import { DevEnvironment } from './types';
import { API_ENVIRONMENTS, CDN_ENVIRONMENTS } from './constants';

export const FALLBACK_ENV = 'test' satisfies DevEnvironment;
export const normalizeLoadingContext = (loadingContext: string) => loadingContext?.replace?.(/([^/])$/, '$1/');
export const normalizeUrl = (url: string) => url?.replace(/^([^/])/, '/$1');

export const resolveEnvironment = (() => {
    const envs: Partial<Record<DevEnvironment, string>> = API_ENVIRONMENTS;
    const cdnEnvs: Partial<Record<DevEnvironment, string>> = CDN_ENVIRONMENTS;

    return (env?: DevEnvironment) => {
        const cdnUrl = cdnEnvs[env ?? FALLBACK_ENV] || cdnEnvs[FALLBACK_ENV]!;
        const apiUrl = envs[env ?? FALLBACK_ENV] || envs[FALLBACK_ENV]!;

        return {
            apiUrl,
            cdnTranslationsUrl: `${cdnUrl}/assets/translations`,
            cdnAssetsUrl: `${cdnUrl}/assets`,
        };
    };
})();
