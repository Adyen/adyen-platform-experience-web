import { describe, expect, test } from 'vitest';
import type { IGrantsResponseDTO } from '@integration-components/types';
import {
    ACTIVE_GRANT,
    ACTIVE_RENEWING_GRANT,
    CAPITAL_STATE_CLOSED_GRANTS,
    CAPITAL_STATE_GRANTS,
    PENDING_GRANT,
    REPAID_GRANT,
} from '../../../../mocks/mock-data/capital';
import { getAdjustedGrants, getGroupedGrants, getHasGrantGroups } from './grants';
import { getEnhancedCapitalState } from '@integration-components/capital/domain';
import localSupportedRegions from '../../config/supportedRegions.json';

describe('getAdjustedGrants', () => {
    test('returns undefined when no grants are available', () => {
        expect(getAdjustedGrants(undefined, undefined, undefined)).toBeUndefined();
    });

    test('prepends the requested grant', () => {
        const state = getEnhancedCapitalState(CAPITAL_STATE_CLOSED_GRANTS, localSupportedRegions);
        const response = { data: [REPAID_GRANT] } as IGrantsResponseDTO;
        expect(getAdjustedGrants(state, response, PENDING_GRANT)).toEqual([PENDING_GRANT, REPAID_GRANT]);
    });

    test('removes active renewed grants', () => {
        const state = getEnhancedCapitalState(CAPITAL_STATE_GRANTS, localSupportedRegions);
        const response = {
            data: [{ ...ACTIVE_RENEWING_GRANT, id: 'active-renewing', renewsGrantId: ACTIVE_GRANT.id }, ACTIVE_GRANT],
        } as IGrantsResponseDTO;
        expect(getAdjustedGrants(state, response, undefined)).toEqual([REPAID_GRANT]);
    });

    test('keeps non-active renewed grants', () => {
        const state = getEnhancedCapitalState(CAPITAL_STATE_CLOSED_GRANTS, localSupportedRegions);
        const response = { data: [ACTIVE_RENEWING_GRANT, REPAID_GRANT] } as IGrantsResponseDTO;

        expect(getAdjustedGrants(state, response, undefined)).toEqual([ACTIVE_RENEWING_GRANT, REPAID_GRANT]);
    });
});

describe('getGroupedGrants', () => {
    test('groups active and pending grants as ongoing while preserving their order', () => {
        expect(getGroupedGrants([REPAID_GRANT, ACTIVE_GRANT, PENDING_GRANT])).toEqual({
            ongoing: [ACTIVE_GRANT, PENDING_GRANT],
            closed: [REPAID_GRANT],
        });
    });
});

describe('getHasGrantGroups', () => {
    test('returns true count only when both groups have grants', () => {
        expect(getHasGrantGroups({ ongoing: [ACTIVE_GRANT], closed: [REPAID_GRANT] })).toBe(true);
        expect(getHasGrantGroups({ ongoing: [ACTIVE_GRANT], closed: [] })).toBe(false);
        expect(getHasGrantGroups({ ongoing: [], closed: [REPAID_GRANT] })).toBe(false);
    });
});
