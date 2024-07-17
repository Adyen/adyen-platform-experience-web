import { CoreOptions } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '@adyen/adyen-platform-experience-web';

export const createAdyenPlatformExperience = async (context: CoreOptions<any>) => {
    const adyenSession = await AdyenPlatformExperience(context);
    return adyenSession;
};
