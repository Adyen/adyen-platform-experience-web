import { AuthSession, CdnFetcher } from '@integration-components/core';
import { EMPTY_OBJECT } from '@integration-components/utils';
import sessionReady from '@integration-components/core/session/utils/sessionReady';
import { getSupportedRegions } from './regions';
import { getEnhancedCapitalState } from './state';

export type ExternalCapitalState = {
    hasGrants: boolean;
    hasOffer: boolean;
    hasRenewableGrants: boolean;
    state: 'isUnqualified' | 'isPreQualified' | 'hasRequestedGrants' | 'isInUnsupportedRegion';
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
        return {
            hasGrants: false,
            hasOffer: false,
            hasRenewableGrants: false,
            state: 'isUnqualified',
        };
    }

    const { dynamicOffer, hasGrants, isRegionSupported, renewableGrants } = capitalState;
    const hasOffer = !!dynamicOffer;
    const hasRenewableGrants = !!renewableGrants.length;

    if (!isRegionSupported) {
        return {
            hasGrants: false,
            hasOffer: false,
            hasRenewableGrants: false,
            state: 'isInUnsupportedRegion',
        };
    }

    let state: ExternalCapitalState['state'] = 'isUnqualified';

    if (hasGrants) {
        state = 'hasRequestedGrants';
    } else if (hasOffer) {
        state = 'isPreQualified';
    }

    return { hasGrants, hasOffer, hasRenewableGrants, state };
};
