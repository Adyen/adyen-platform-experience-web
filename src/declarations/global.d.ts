// Makes this a module (required since this file has no other imports)
export {};

declare global {
    /**
     * Shape of the global `window.AdyenPlatformExperienceSDK` object.
     */
    interface AdyenPlatformExperienceSDK {
        /** The SDK version (e.g. 1.11.0) */
        readonly version: string;
    }

    interface Window {
        /** Read-only global set by the SDK at runtime. */
        readonly AdyenPlatformExperienceSDK: AdyenPlatformExperienceSDK;
    }
}
