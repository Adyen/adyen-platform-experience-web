import type { DevEnvironment } from './types';
import { API_ENVIRONMENTS, CDN_ENVIRONMENTS } from './constants';

export const FALLBACK_ENV = 'test' satisfies DevEnvironment;
export const FALLBACK_CDN_ENV = 'live' satisfies DevEnvironment;
export const normalizeLoadingContext = (loadingContext: string) => loadingContext?.replace?.(/([^/])$/, '$1/');
export const normalizeUrl = (url: string) => url?.replace(/^([^/])/, '/$1');

export const resolveEnvironment = (() => {
    const envs: Partial<Record<DevEnvironment, string>> = API_ENVIRONMENTS;
    const cdnEnvs: Partial<Record<DevEnvironment, string>> = CDN_ENVIRONMENTS;

    return (env?: DevEnvironment) => {
        const cdnEnv = process.env.VITE_TEST_CDN_ASSETS ? 'test' : env === 'test' ? 'live' : env;

        const cdnUrl = cdnEnvs[cdnEnv ?? FALLBACK_CDN_ENV] || cdnEnvs[FALLBACK_CDN_ENV]!;
        const apiUrl = envs[env ?? FALLBACK_ENV] || envs[FALLBACK_ENV]!;

        return {
            apiUrl,
            cdnTranslationsUrl: `${cdnUrl}/assets/translations`,
            cdnAssetsUrl: `${cdnUrl}/assets`,
            cdnConfigUrl: `${cdnUrl}/config`,
        };
    };
})();

export const getConfigFromCdn = ({ url }: { url: string }) => {
    return async <Fallback>({
        name,
        extension = 'json',
        fallback,
        subFolder = '',
    }: {
        name: string;
        extension?: string;
        subFolder?: string;
        fallback?: Fallback;
    }) => {
        // If VITE_LOCAL_ASSETS is enabled load from local config folder
        if (process.env.VITE_LOCAL_ASSETS) {
            try {
                const configPath = `../config${subFolder ? `/${subFolder}` : ''}/${name}.${extension}`;
                const module = await import(/* @vite-ignore */ configPath);
                return module.default || module;
            } catch (error) {
                console.warn(error);
                return fallback;
            }
        }

        // Otherwise, fetch from CDN
        try {
            return await httpGet<any>({
                loadingContext: `${url}${subFolder ? `/${subFolder}` : ''}`,
                path: `/${name}.${extension}`,
                versionless: true,
                skipContentType: true,
            });
        } catch (error) {
            console.warn(error);
            return fallback;
        }
    };
};

export const getDatasetFromCdn = ({ url }: { url: string }) => {
    return async <Fallback>({
        name,
        extension = 'json',
        fallback,
        subFolder = '',
    }: {
        name: string;
        extension?: string;
        subFolder?: string;
        fallback?: Fallback;
    }) => {
        // If VITE_LOCAL_ASSETS is enabled, fetch from local /datasets static path
        if (process.env.VITE_LOCAL_ASSETS) {
            try {
                const datasetPath = `/datasets${subFolder ? `/${subFolder}` : ''}/${name}.${extension}`;
                const response = await fetch(datasetPath);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${datasetPath}: ${response.status}`);
                }
                return (await response.json()) as Fallback;
            } catch (error) {
                console.warn(error);
                return fallback as Fallback;
            }
        }

        // Otherwise, fetch from CDN
        try {
            return (await httpGet<any>({
                loadingContext: `${url}${subFolder ? `/${subFolder}` : ''}`,
                path: `/${name}.${extension}`,
                versionless: true,
                skipContentType: true,
            })) as Fallback;
        } catch (error) {
            console.warn(error);
            return fallback as Fallback;
        }
    };
};

async function httpGet<T>(options: { loadingContext: string; path: string; versionless?: boolean; skipContentType?: boolean }): Promise<T> {
    const { loadingContext, path, skipContentType } = options;
    const baseUrl = normalizeLoadingContext(loadingContext);
    const url = new URL(`${baseUrl}${normalizeUrl(path)}`);

    const headers: Record<string, string> = {
        Accept: 'application/json, text/plain, */*',
    };

    if (!skipContentType) {
        headers['Content-Type'] = 'application/json';
    }

    if (process.env.VITE_VERSION) {
        headers['SDK-Version'] = process.env.VITE_VERSION;
    }

    const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        credentials: 'same-origin',
        headers,
        redirect: 'follow',
        referrerPolicy: 'no-referrer-when-downgrade',
    });

    if (!response.ok) {
        throw new Error(`Request to ${url} failed with status ${response.status}`);
    }

    return await response.json();
}
