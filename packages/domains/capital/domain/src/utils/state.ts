import type { ICapitalState, IDynamicOffersConfig, IGrant, IGrantOfferResponseDTO } from '@integration-components/types';
import { type SupportedRegions } from './regions';

export type EnhancedCapitalState = {
    dynamicOffer: ICapitalState['dynamicOffer'];
    hasGrants: boolean;
    isRegionSupported: boolean;
    region?: string;
    renewableGrants: ICapitalState['activeOrPendingGrants'];
    renewsGrantIds: ReadonlySet<string>;
};

export type SimplifiedGrant = Pick<
    IGrantOfferResponseDTO,
    | 'aprBasisPoints'
    | 'expectedRepaymentPeriodDays'
    | 'feesAmount'
    | 'grantAmount'
    | 'id'
    | 'maximumRepaymentPeriodDays'
    | 'repaymentRate'
    | 'thresholdAmount'
    | 'totalAmount'
>;

const isGrantRenewable = (grant: IGrant, dynamicOffer: IDynamicOffersConfig, renewsGrantIds: ReadonlySet<string>): boolean => {
    const minimumRenewalAmount = grant.renewal?.eligible ? grant.renewal?.minimumRenewalAmount?.value : undefined;
    const maxOfferAmount = dynamicOffer.maxAmount.value;
    return !renewsGrantIds.has(grant.id) && !!minimumRenewalAmount && !!maxOfferAmount && minimumRenewalAmount <= maxOfferAmount;
};

export const getEnhancedCapitalState = (
    state: ICapitalState | undefined,
    supportedRegions: SupportedRegions,
    requestedGrant?: IGrant
): EnhancedCapitalState | undefined => {
    if (!state) return undefined;
    const activeOrPendingGrants = requestedGrant ? [requestedGrant, ...state.activeOrPendingGrants] : state.activeOrPendingGrants;
    const dynamicOffer = state.dynamicOffer;
    const region = state.legalEntity?.region;

    const isRegionSupported = !!region && supportedRegions.includes(region);
    const hasGrants = !!(activeOrPendingGrants?.length || state.hasClosedGrants);
    const renewsGrantIds = new Set(activeOrPendingGrants?.map(grant => grant.renewsGrantId).filter((id): id is string => !!id));

    const renewableGrants =
        dynamicOffer && activeOrPendingGrants?.length
            ? activeOrPendingGrants.filter(grant => isGrantRenewable(grant, dynamicOffer, renewsGrantIds))
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

export const shouldGetGrants = (serverState: ICapitalState | undefined, isRegionSupported: boolean): boolean => {
    const hasGrantsOnServer = !!(serverState?.activeOrPendingGrants?.length || serverState?.hasClosedGrants);
    return isRegionSupported && hasGrantsOnServer;
};

export const getIsEarlyRenewal = (state: EnhancedCapitalState): boolean => !!state.renewableGrants.length;

export const getSimplifiedRenewableGrant = (state: EnhancedCapitalState): SimplifiedGrant | undefined => {
    const renewableGrant = state.renewableGrants[0];
    if (!renewableGrant) return undefined;

    return {
        expectedRepaymentPeriodDays: renewableGrant.expectedRepaymentPeriodDays,
        feesAmount: renewableGrant.feesAmount,
        grantAmount: renewableGrant.grantAmount,
        id: renewableGrant.id,
        maximumRepaymentPeriodDays: renewableGrant.maximumRepaymentPeriodDays,
        repaymentRate: renewableGrant.repaymentRate,
        thresholdAmount: renewableGrant.thresholdAmount,
        totalAmount: renewableGrant.totalAmount,
    };
};
