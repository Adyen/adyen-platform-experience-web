import { describe, expect, test } from 'vitest';
import type { IGrant } from '@integration-components/types';
import {
    ACTIVE_LOAN,
    CAPITAL_STATE_ELIGIBLE_LOAN,
    CAPITAL_STATE_GRANTS_LOAN,
    PENDING_LOAN,
    RENEWING_ACTIVE_LOAN,
    REPAID_LOAN,
} from '../../../../mocks/mock-data';
import { getAdjustedGrants, getGroupedGrants, getHasGrantGroups } from './grants';
import { getEnhancedCapitalState } from '@integration-components/capital/domain';
import localSupportedRegions from '../../config/supportedRegions.json';

describe('getAdjustedGrants', () => {
    test('returns undefined when no grants are available', () => {
        expect(getAdjustedGrants(undefined, undefined, undefined)).toBeUndefined();
    });

    test('prepends the requested grant if it is not in the array ', () => {
        const state = getEnhancedCapitalState(CAPITAL_STATE_ELIGIBLE_LOAN, localSupportedRegions);
        expect(getAdjustedGrants(state, [REPAID_LOAN], PENDING_LOAN)).toEqual([PENDING_LOAN, REPAID_LOAN]);
        expect(getAdjustedGrants(state, [PENDING_LOAN, REPAID_LOAN], PENDING_LOAN)).toEqual([PENDING_LOAN, REPAID_LOAN]);
    });

    test('removes renewed active grants', () => {
        const state = getEnhancedCapitalState(CAPITAL_STATE_GRANTS_LOAN, localSupportedRegions);
        const renewedActiveGrant: IGrant = { ...REPAID_LOAN, status: 'Active' };
        const response = [RENEWING_ACTIVE_LOAN, renewedActiveGrant];
        expect(getAdjustedGrants(state, response, undefined)).toEqual([RENEWING_ACTIVE_LOAN]);
    });

    test('keeps non-active renewed grants', () => {
        const state = getEnhancedCapitalState(CAPITAL_STATE_ELIGIBLE_LOAN, localSupportedRegions);
        const response = [RENEWING_ACTIVE_LOAN, REPAID_LOAN];

        expect(getAdjustedGrants(state, response, undefined)).toEqual([RENEWING_ACTIVE_LOAN, REPAID_LOAN]);
    });
});

describe('getGroupedGrants', () => {
    test('groups active and pending grants as ongoing while preserving their order', () => {
        expect(getGroupedGrants([REPAID_LOAN, ACTIVE_LOAN, PENDING_LOAN])).toEqual({
            ongoing: [ACTIVE_LOAN, PENDING_LOAN],
            closed: [REPAID_LOAN],
        });
    });
});

describe('getHasGrantGroups', () => {
    test('returns true count only when both groups have grants', () => {
        expect(getHasGrantGroups({ ongoing: [ACTIVE_LOAN], closed: [REPAID_LOAN] })).toBe(true);
        expect(getHasGrantGroups({ ongoing: [ACTIVE_LOAN], closed: [] })).toBe(false);
        expect(getHasGrantGroups({ ongoing: [], closed: [REPAID_LOAN] })).toBe(false);
    });
});
