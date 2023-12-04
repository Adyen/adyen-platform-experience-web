import { FALLBACK_CONTEXT, GENERIC_OPTIONS } from './config';
import { DevEnvironment, CoreOptions } from './types';

/**
 * Filter properties in a global configuration object from an allow list (GENERIC_OPTIONS)
 * @param globalOptions -
 * @returns any
 */
export function processGlobalOptions(globalOptions?: CoreOptions) {
    return globalOptions
        ? Object.keys(globalOptions).reduce((r, e) => {
              const optionKey = e as keyof CoreOptions;
              if (GENERIC_OPTIONS.includes(e)) r[optionKey] = globalOptions[optionKey];
              return r;
          }, {} as CoreOptions)
        : {};
}

export function resolveEnvironment(env?: DevEnvironment): string {
    //TODO - Use real urls once we have our BFF defined.
    const envs: Record<DevEnvironment, string> = {
        test: '',
        live: '',
    };
    return env ? envs[env] : FALLBACK_CONTEXT;
}

export const normalizeLoadingContext = (loadingContext: string) => (loadingContext.endsWith('/') ? loadingContext : `${loadingContext}/`);
