import { AuthSession, CdnFetcher } from '@integration-components/core';
import { EMPTY_OBJECT } from '@integration-components/utils';
import sessionReady from '@integration-components/core/session/utils/sessionReady';
import { getSupportedRegions } from './regions';
import { getEnhancedCapitalState } from './state';

export type ExternalCapitalState =
    | { isAvailable: false }
    | {
          isAvailable: true;
          isRegionSupported: boolean;
          hasGrants: boolean;
          hasRenewableGrants: boolean;
          dynamicOfferConfig?: {
              minAmount: number;
              maxAmount: number;
              currency: string;
          };
      };

export const getExternalCapitalState = async (session: AuthSession, getCdnConfig?: CdnFetcher): Promise<ExternalCapitalState> => {
    await sessionReady(session);
    const { getCapitalState } = session.context.endpoints;
    const [capitalStateResponse, supportedRegions] = await Promise.all([
        getCapitalState?.(EMPTY_OBJECT, { query: EMPTY_OBJECT }).catch(() => undefined),
        getSupportedRegions(getCdnConfig),
    ]);

    const capitalState = getEnhancedCapitalState(capitalStateResponse, supportedRegions);

    if (!capitalState) {
        return { isAvailable: false };
    }

    const { dynamicOfferConfig, hasGrants, isRegionSupported, renewableGrants } = capitalState;

    return {
        isAvailable: true,
        isRegionSupported,
        hasGrants,
        hasRenewableGrants: !!renewableGrants.length,
        dynamicOfferConfig: dynamicOfferConfig && {
            minAmount: dynamicOfferConfig.minAmount.value,
            maxAmount: dynamicOfferConfig.maxAmount.value,
            currency: dynamicOfferConfig.minAmount.currency,
        },
    };
};
