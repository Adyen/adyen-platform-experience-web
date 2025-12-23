import { DevEnvironment } from './types';
import { API_ENVIRONMENTS, CDN_ENVIRONMENTS } from './constants';
import { httpGet } from './Http/http';

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
                errorLevel: 'error',
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
        // If VITE_LOCAL_ASSETS is enabled load from local assets/datasets folder
        if (process.env.VITE_LOCAL_ASSETS) {
            try {
                const datasetPath = `../assets/datasets${subFolder ? `/${subFolder}` : ''}/${name}.${extension}`;
                const module = await import(/* @vite-ignore */ datasetPath);
                return (module.default || module) as Fallback;
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
                errorLevel: 'error',
            })) as Fallback;
        } catch (error) {
            console.warn(error);
            // Try dynamic import of local dataset as a fallback
            try {
                const datasetPath = `../assets/datasets${subFolder ? `/${subFolder}` : ''}/${name}.${extension}`;
                const module = await import(/* @vite-ignore */ datasetPath);
                return (module.default || module) as Fallback;
            } catch (localError) {
                console.warn(localError);
                return fallback as Fallback;
            }
        }
    };
};
