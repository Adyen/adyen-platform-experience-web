import { describe, expect, test } from 'vitest';
import localSupportedRegions from '../config/supportedRegions.json';
import {
    ACTIVE_GRANT,
    CAPITAL_STATE_ACTIVE_GRANT,
    CAPITAL_STATE_CLOSED_GRANTS,
    CAPITAL_STATE_FIRST_OFFER,
    CAPITAL_STATE_GRANTS,
    CAPITAL_STATE_INELIGIBLE,
    CAPITAL_STATE_RENEWABLE_GRANT,
    CAPITAL_STATE_UNSUPPORTED_REGION,
    CAPITAL_STATE_PENDING_GRANT,
} from '../../../mocks/mock-data/capital';
import { getEnhancedCapitalState, getIsEarlyRenewal, shouldGetGrants, getSimplifiedRenewableGrant } from './state';

describe('getEnhancedCapitalState', () => {
    test('returns undefined when no capital state is available', () => {
        expect(getEnhancedCapitalState(undefined, localSupportedRegions)).toBeUndefined();
    });

    test('returns dynamic offer when there are no ongoing grants or there is a valid renewal', () => {
        expect(getEnhancedCapitalState(CAPITAL_STATE_INELIGIBLE, localSupportedRegions)).toMatchObject({ dynamicOffer: undefined });
        expect(getEnhancedCapitalState(CAPITAL_STATE_FIRST_OFFER, localSupportedRegions)).toMatchObject({
            dynamicOffer: CAPITAL_STATE_FIRST_OFFER.dynamicOffer,
        });
        expect(getEnhancedCapitalState(CAPITAL_STATE_PENDING_GRANT, localSupportedRegions)).toMatchObject({ dynamicOffer: undefined });
        expect(getEnhancedCapitalState(CAPITAL_STATE_ACTIVE_GRANT, localSupportedRegions)).toMatchObject({ dynamicOffer: undefined });
        expect(getEnhancedCapitalState(CAPITAL_STATE_RENEWABLE_GRANT, localSupportedRegions)).toMatchObject({
            dynamicOffer: CAPITAL_STATE_RENEWABLE_GRANT.dynamicOffer,
        });
        expect(getEnhancedCapitalState(CAPITAL_STATE_CLOSED_GRANTS, localSupportedRegions)).toMatchObject({
            dynamicOffer: CAPITAL_STATE_CLOSED_GRANTS.dynamicOffer,
        });
    });

    test('identifies ongoing and closed grants', () => {
        expect(getEnhancedCapitalState(CAPITAL_STATE_FIRST_OFFER, localSupportedRegions)).toMatchObject({ hasGrants: false });
        expect(getEnhancedCapitalState(CAPITAL_STATE_PENDING_GRANT, localSupportedRegions)).toMatchObject({ hasGrants: true });
        expect(getEnhancedCapitalState(CAPITAL_STATE_ACTIVE_GRANT, localSupportedRegions)).toMatchObject({ hasGrants: true });
        expect(getEnhancedCapitalState(CAPITAL_STATE_CLOSED_GRANTS, localSupportedRegions)).toMatchObject({ hasGrants: true });
        expect(getEnhancedCapitalState(CAPITAL_STATE_GRANTS, localSupportedRegions)).toMatchObject({ hasGrants: true });
    });

    test('identifies whether the legal entity region is supported', () => {
        expect(getEnhancedCapitalState(CAPITAL_STATE_UNSUPPORTED_REGION, localSupportedRegions)).toMatchObject({ isRegionSupported: false });
        expect(getEnhancedCapitalState(CAPITAL_STATE_GRANTS, localSupportedRegions)).toMatchObject({ isRegionSupported: true });
    });

    test('returns the legal entity region', () => {
        expect(getEnhancedCapitalState(CAPITAL_STATE_UNSUPPORTED_REGION, localSupportedRegions)).toMatchObject({
            region: CAPITAL_STATE_UNSUPPORTED_REGION.legalEntity?.region,
        });
        expect(getEnhancedCapitalState(CAPITAL_STATE_GRANTS, localSupportedRegions)).toMatchObject({
            region: CAPITAL_STATE_GRANTS.legalEntity?.region,
        });
    });

    test('marks grant as renewable when minimum renewal amount is less than offer minimum', () => {
        expect(getEnhancedCapitalState(CAPITAL_STATE_RENEWABLE_GRANT, localSupportedRegions)).toMatchObject({
            renewableGrants: [CAPITAL_STATE_RENEWABLE_GRANT.activeOrPendingGrants[0]],
        });
        expect(getEnhancedCapitalState(CAPITAL_STATE_ACTIVE_GRANT, localSupportedRegions)).toMatchObject({ renewableGrants: [] });
    });

    test('marks grant as renewable when minimum renewal amount equals the offer maximum', () => {
        const state = {
            ...CAPITAL_STATE_RENEWABLE_GRANT,
            activeOrPendingGrants: [
                {
                    ...CAPITAL_STATE_RENEWABLE_GRANT.activeOrPendingGrants[0]!,
                    renewal: {
                        eligible: true,
                        minimumRenewalAmount: { value: 2500000, currency: 'EUR' },
                    },
                },
            ],
        };

        expect(getEnhancedCapitalState(state, localSupportedRegions)).toMatchObject({
            dynamicOffer: CAPITAL_STATE_RENEWABLE_GRANT.dynamicOffer,
            renewableGrants: state.activeOrPendingGrants,
        });
    });

    test('marks grant as nonrenewable when minimum renewal amount exceeds the offer maximum', () => {
        const state = {
            ...CAPITAL_STATE_RENEWABLE_GRANT,
            activeOrPendingGrants: [
                {
                    ...CAPITAL_STATE_RENEWABLE_GRANT.activeOrPendingGrants[0]!,
                    renewal: {
                        eligible: true,
                        minimumRenewalAmount: { value: 2500001, currency: 'EUR' },
                    },
                },
            ],
        };

        expect(getEnhancedCapitalState(state, localSupportedRegions)).toMatchObject({
            dynamicOffer: undefined,
            renewableGrants: [],
        });
    });

    test('identifies grants that are already being renewed', () => {
        expect(getEnhancedCapitalState(CAPITAL_STATE_GRANTS, localSupportedRegions)).toMatchObject({
            renewsGrantIds: [CAPITAL_STATE_GRANTS.activeOrPendingGrants[0]!.renewsGrantId],
        });
        expect(getEnhancedCapitalState(CAPITAL_STATE_ACTIVE_GRANT, localSupportedRegions)).toMatchObject({ renewsGrantIds: [] });
    });
});

describe('shouldGetGrants', () => {
    test('permits grants retrieval only when there are grants on server and region is supported', () => {
        expect(shouldGetGrants(CAPITAL_STATE_ACTIVE_GRANT, true)).toBe(true);
        expect(shouldGetGrants(CAPITAL_STATE_CLOSED_GRANTS, true)).toBe(true);
        expect(shouldGetGrants(CAPITAL_STATE_FIRST_OFFER, true)).toBe(false);
        expect(shouldGetGrants(CAPITAL_STATE_ACTIVE_GRANT, false)).toBe(false);
        expect(shouldGetGrants(undefined, true)).toBe(false);
    });
});

describe('getIsEarlyRenewal', () => {
    test('returns true only when the state has renewable grants', () => {
        expect(getIsEarlyRenewal(getEnhancedCapitalState(CAPITAL_STATE_RENEWABLE_GRANT, localSupportedRegions)!)).toBe(true);
        expect(getIsEarlyRenewal(getEnhancedCapitalState(CAPITAL_STATE_FIRST_OFFER, localSupportedRegions)!)).toBe(false);
    });
});

describe('getSimplifiedRenewableGrant', () => {
    test('returns a renewable grant with enough fields to create a new offer', () => {
        const state = getEnhancedCapitalState(CAPITAL_STATE_RENEWABLE_GRANT, localSupportedRegions)!;
        expect(getSimplifiedRenewableGrant(state)).toEqual({
            expectedRepaymentPeriodDays: 360,
            feesAmount: ACTIVE_GRANT.feesAmount,
            grantAmount: ACTIVE_GRANT.grantAmount,
            id: ACTIVE_GRANT.id,
            maximumRepaymentPeriodDays: 450,
            repaymentRate: 1500,
            thresholdAmount: ACTIVE_GRANT.thresholdAmount,
            totalAmount: ACTIVE_GRANT.totalAmount,
        });
    });

    test('returns undefined when there is no renewable grant', () => {
        expect(getSimplifiedRenewableGrant(getEnhancedCapitalState(CAPITAL_STATE_FIRST_OFFER, localSupportedRegions)!)).toBeUndefined();
    });
});
