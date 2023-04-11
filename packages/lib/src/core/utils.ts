import { GENERIC_OPTIONS } from './config';
import { CoreOptions } from './types';

/**
 * Filter properties in a global configuration object from an allow list (GENERIC_OPTIONS)
 * @param globalOptions -
 * @returns any
 */
export function processGlobalOptions(globalOptions: CoreOptions) {
    return Object.keys(globalOptions).reduce((r, e) => {
        if (GENERIC_OPTIONS.includes(e)) r[e] = globalOptions[e];
        return r;
    }, {} as CoreOptions);
}
