import * as AdyenPlatformExperienceWeb from './index';

export * from './index';

const CDN_GLOBAL_KEY = 'AdyenPlatformExperienceWeb';

if (typeof window !== 'undefined' && !(CDN_GLOBAL_KEY in window)) {
    Object.defineProperty(window, CDN_GLOBAL_KEY, {
        value: AdyenPlatformExperienceWeb,
        enumerable: true,
    });
}
