import { FALLBACK_CDN_CONTEXT, FALLBACK_CONTEXT } from './config';
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

export function resolveCDNEnvironment(env?: DevEnvironment) {
    //TODO - Use real urls once we define our own CDN.
    const envs: Record<DevEnvironment, string> = {
        beta: 'https://cdf6519016.cdn.adyen.com/checkoutshopper/',
        test: 'https://checkoutshopper-test.adyen.com/checkoutshopper/',
        live: 'https://checkoutshopper-live.adyen.com/checkoutshopper/',
    };
    return env ? envs[env] : FALLBACK_CDN_CONTEXT;
}

export const normalizeLoadingContext = (loadingContext: string) => (loadingContext.endsWith('/') ? loadingContext : `${loadingContext}/`);
export const normalizeUrl = (url: string) => (url.startsWith('/') ? url : `/${url}`);
