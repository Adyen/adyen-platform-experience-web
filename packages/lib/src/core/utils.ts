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
        test: '',
        live: '',
    };
    return env ? envs[env] || FALLBACK_CONTEXT : FALLBACK_CONTEXT;
}

export const normalizeLoadingContext = (loadingContext: string) => (loadingContext.endsWith('/') ? loadingContext : `${loadingContext}/`);
export const normalizeUrl = (url: string) => (url.startsWith('/') ? url : `/${url}`);
