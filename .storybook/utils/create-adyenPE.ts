import { CoreOptions, AdyenPlatformExperience } from '../../src';

export const createAdyenPlatformExperience = async (context: CoreOptions<any>) => {
    const adyenSession = await AdyenPlatformExperience(context);
    return adyenSession;
};
