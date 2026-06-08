import { CapitalComponentState } from '../../CapitalOverview/types';
import sessionReady from '@integration-components/core/session/utils/sessionReady';
import { EMPTY_OBJECT } from '@integration-components/utils';
import { AuthSession } from '@integration-components/core';
import { isCapitalRegionSupported } from '../../internal/CapitalHeader/helpers';

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

    const hasGrants = !!capitalStateResponse?.hasGrants;
    const hasOffer = !!capitalStateResponse?.dynamicOffer;
    const hasRenewableGrants = !!capitalStateResponse?.renewableGrants;
    let state: CapitalComponentState['state'] = 'isUnqualified';

    if (hasGrants) {
        state = 'hasRequestedGrants';
    } else if (hasOffer) {
        state = 'isPreQualified';
    }

    return { hasGrants, hasOffer, hasRenewableGrants, state };
};
