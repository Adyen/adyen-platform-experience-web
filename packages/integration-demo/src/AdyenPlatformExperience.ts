import { AdyenPlatformExperience as AdyenPlatformExperienceCore } from '@adyen/adyen-platform-experience-web';

import { getSessionToken } from './utils';

export class AdyenPlatformExperience {
    private static instance: AdyenPlatformExperience | null = null;
    private static initializationPromise: Promise<AdyenPlatformExperience> | null = null;
    private _core;

    private constructor(coreInstance: any) {
        this._core = coreInstance;
    }

    public get core() {
        if (!this._core) {
            throw new Error('AdyenPlatformExperience core has not been initialized yet. Ensure getInstance() has completed.');
        }
        return this._core;
    }

    public static async getInstance(): Promise<AdyenPlatformExperience> {
        if (!AdyenPlatformExperience.initializationPromise) {
            AdyenPlatformExperience.initializationPromise = (async () => {
                try {
                    const core = await AdyenPlatformExperienceCore({
                        availableTranslations: [],
                        onSessionCreate: getSessionToken,
                        locale: 'en-US',
                    });
                    AdyenPlatformExperience.instance = new AdyenPlatformExperience(core);
                    return AdyenPlatformExperience.instance;
                } catch (error) {
                    console.error('AdyenPlatformExperience: Failed to initialize core:', error);
                    AdyenPlatformExperience.initializationPromise = null;
                    throw error;
                }
            })();
        }
        return AdyenPlatformExperience.initializationPromise;
    }
}
