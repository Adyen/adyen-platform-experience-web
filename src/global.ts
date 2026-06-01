// Pulls in the global augmentations (AdyenPlatformExperienceMetadata, Window) from the declaration file.
// Using `import type` rather than a triple-slash reference to avoid @typescript-eslint/triple-slash-reference errors.
import type {} from './declarations/global';
import { Core } from './core';

/** A property with this name will be exposed via the global (window) object. */
const globalKey = 'AdyenPlatformExperienceMetadata' satisfies keyof typeof window;

/**
 * Creates a null-prototype object whose properties are non-writable and non-configurable.
 * Used to produce a frozen-like struct that cannot be accidentally reassigned or deleted.
 */
const fixedStruct = <T extends Record<string, any>>(obj: T) => {
    const descriptors = (Object.entries(obj) as [keyof T, T[keyof T]][]).reduce(
        (descriptors, [key, value]) => {
            descriptors[key] = { value, enumerable: true };
            return descriptors;
        },
        {} as { [K in keyof T]: { value: T[K]; enumerable: true } }
    );

    return Object.create(Object.prototype, descriptors);
};

if (typeof window !== 'undefined' && !(globalKey in window)) {
    const globalObj: AdyenPlatformExperienceMetadata = {
        version: Core.version,
    } as const;

    Object.defineProperty(window, globalKey, {
        value: fixedStruct(globalObj),
        enumerable: true,
    });
}

export default globalKey;
