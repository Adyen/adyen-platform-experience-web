import { CoreOptions } from '@adyen/adyen-fp-web/src/core/types';
import { AdyenFP } from '@adyen/adyen-fp-web';

export const createAdyenFP = async (context: CoreOptions) => {
    const adyenSession = await AdyenFP(context);
    return adyenSession;
};
