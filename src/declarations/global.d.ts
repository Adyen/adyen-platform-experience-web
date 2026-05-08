// Makes this a module (required since this file has no other imports)
export {};

declare global {
    /**
     * Shape of the global `window.AdyenPlatformExperienceMetadata` object.
     */
    interface AdyenPlatformExperienceMetadata {
        /** The SDK version (e.g. 1.11.0) */
        readonly version: string;
    }

    interface Window {
        /** Read-only global set by the SDK at runtime. */
        readonly AdyenPlatformExperienceMetadata: AdyenPlatformExperienceMetadata;
    }
}
