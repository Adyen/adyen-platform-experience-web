import { FALLBACK_CONTEXT } from './config';
import { DevEnvironment } from './types';

/**
 * Filter properties in a global configuration object from an allow list (GENERIC_OPTIONS)
 * @param globalOptions -
 * @returns any
 */

export function resolveEnvironment(env?: DevEnvironment) {
    //TODO - Use real urls once we have our BFF defined.
    const envs: Partial<Record<DevEnvironment, string>> = {
        test: 'https://platform-components-external-test.adyen.com/platform-components-external/api/',
        live: 'https://platform-components-external-live.adyen.com/platform-components-external/api/',
    };
    return env ? envs[env] || FALLBACK_CONTEXT : FALLBACK_CONTEXT;
}

export const normalizeLoadingContext = (loadingContext: string) => (loadingContext.endsWith('/') ? loadingContext : `${loadingContext}/`);
export const normalizeUrl = (url: string) => (url.startsWith('/') ? url : `/${url}`);
