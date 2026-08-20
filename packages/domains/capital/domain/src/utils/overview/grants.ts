import type { IGrant, IGrantsResponseDTO } from '@integration-components/types';
import type { EnhancedCapitalState } from '../state';

type GroupedGrants = {
    ongoing: IGrant[];
    closed: IGrant[];
};

export const getAdjustedGrants = (
    state: EnhancedCapitalState | undefined,
    grants: IGrantsResponseDTO | undefined,
    requestedGrant: IGrant | undefined
): IGrant[] | undefined => {
    const extractedGrants = grants?.data;
    const adjustedGrants = requestedGrant ? [requestedGrant, ...(extractedGrants ?? [])] : extractedGrants;
    return adjustedGrants?.filter(grant => !(grant.status === 'Active' && state?.renewsGrantIds.has(grant.id)));
};

export const getGroupedGrants = (grants: readonly IGrant[]): GroupedGrants => {
    const ongoing: IGrant[] = [];
    const closed: IGrant[] = [];

    grants.forEach(grant => {
        if (grant.status === 'Active' || grant.status === 'Pending') {
            ongoing.push(grant);
        } else {
            closed.push(grant);
        }
    });

    return { ongoing, closed };
};

export const getHasGrantGroups = ({ ongoing, closed }: GroupedGrants) => {
    return !!ongoing.length && !!closed.length;
};
