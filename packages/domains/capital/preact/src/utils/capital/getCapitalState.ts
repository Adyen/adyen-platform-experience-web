import { CapitalComponentState } from '../../CapitalOverview/types';
import sessionReady from '@integration-components/core/session/utils/sessionReady';
import { EMPTY_OBJECT } from '@integration-components/utils';
import { AuthSession } from '@integration-components/core';
import { ICapitalState, IDynamicOffersConfig, IGrant } from '@integration-components/types';
import supportedRegions from '../../../../domain/src/config/supportedRegions.json';

export type EnhancedCapitalState = {
    dynamicOffer: ICapitalState['dynamicOffer'];
    hasGrants: boolean;
    isRegionSupported: boolean;
    region?: string;
    renewableGrants: ICapitalState['activeOrPendingGrants'];
    renewsGrantIds: ReadonlySet<string>;
};

const isGrantRenewable = (grant: IGrant, dynamicOffer: IDynamicOffersConfig, renewsGrantIds: ReadonlySet<string>) => {
    const minimumRenewalAmount = grant.renewal?.eligible ? grant.renewal?.minimumRenewalAmount?.value : undefined;
    const maxOfferAmount = dynamicOffer.maxAmount.value;
    return !renewsGrantIds.has(grant.id) && !!minimumRenewalAmount && maxOfferAmount && minimumRenewalAmount <= maxOfferAmount;
};

export const getEnhancedCapitalState = (state: ICapitalState | undefined): EnhancedCapitalState => {
    const activeOrPendingGrants = state?.activeOrPendingGrants;
    const dynamicOffer = state?.dynamicOffer;
    const region = state?.legalEntity?.region;

    const isRegionSupported = !!region && supportedRegions.includes(region);
    const hasGrants = !!(activeOrPendingGrants?.length || state?.hasClosedGrants);
    const renewsGrantIds = new Set(activeOrPendingGrants?.map(grant => grant.renewsGrantId).filter((id): id is string => !!id));

    const renewableGrants =
        dynamicOffer && activeOrPendingGrants?.length
            ? activeOrPendingGrants?.filter(grant => isGrantRenewable(grant, dynamicOffer, renewsGrantIds))
            : [];

    const isOfferValid = !!dynamicOffer && (!activeOrPendingGrants?.length || !!renewableGrants.length);

    return {
        dynamicOffer: isOfferValid ? dynamicOffer : undefined,
        hasGrants,
        isRegionSupported,
        region,
        renewableGrants,
        renewsGrantIds,
    };
};

export const getCapitalState = async (session: AuthSession): Promise<CapitalComponentState> => {
    await sessionReady(session);
    const { getCapitalState } = session.context.endpoints;
    const capitalStateResponse = await getCapitalState?.(EMPTY_OBJECT, { query: EMPTY_OBJECT }).catch(() => undefined);
    const { dynamicOffer, hasGrants, isRegionSupported, renewableGrants } = getEnhancedCapitalState(capitalStateResponse);

    if (capitalStateResponse && !isRegionSupported) {
        return {
            hasGrants: false,
            hasOffer: false,
            hasRenewableGrants: false,
            state: 'isInUnsupportedRegion',
        };
    }

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
