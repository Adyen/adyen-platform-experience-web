import { CapitalComponentState } from '../../CapitalOverview/types';
import sessionReady from '@integration-components/core/session/utils/sessionReady';
import { EMPTY_OBJECT } from '@integration-components/utils';
import { AuthSession } from '@integration-components/core';
import { isCapitalRegionSupported } from '../../internal/CapitalHeader/helpers';
import { ICapitalState } from '@integration-components/types';

export type EnhancedCapitalState = {
    hasGrants: boolean;
    dynamicOffer: ICapitalState['dynamicOffer'];
    renewableGrants: ICapitalState['activeOrPendingGrants'];
};

export const getEnhancedCapitalState = (state: ICapitalState | undefined): EnhancedCapitalState => {
    const hasGrants = !!(state?.activeOrPendingGrants.length || state?.hasClosedGrants);
    const renewableGrants = state?.activeOrPendingGrants.filter(grant => grant.renewal?.eligible) || [];

    return {
        hasGrants,
        dynamicOffer: state?.dynamicOffer,
        renewableGrants,
    };
};

export const getCapitalState = async (session: AuthSession): Promise<CapitalComponentState> => {
    await sessionReady(session);
    const legalEntity = session.context.extraConfig?.legalEntity;

    if (!isCapitalRegionSupported(legalEntity)) {
        return {
            hasGrants: false,
            hasOffer: false,
            hasRenewableGrants: false,
            state: 'isInUnsupportedRegion',
        };
    }

    const { getCapitalState } = session.context.endpoints;
    const capitalStateResponse = await getCapitalState?.(EMPTY_OBJECT, { query: EMPTY_OBJECT }).catch(() => undefined);

    const { hasGrants, dynamicOffer, renewableGrants } = getEnhancedCapitalState(capitalStateResponse);
    const hasOffer = !!dynamicOffer;
    const hasRenewableGrants = !!renewableGrants.length;
    let state: CapitalComponentState['state'] = 'isUnqualified';

    if (hasGrants) {
        state = 'hasRequestedGrants';
    } else if (hasOffer) {
        state = 'isPreQualified';
    }

    return { hasGrants, hasOffer, hasRenewableGrants, state };
};
