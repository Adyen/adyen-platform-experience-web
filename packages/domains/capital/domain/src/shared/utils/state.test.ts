import { describe, expect, test } from 'vitest';
import localSupportedRegions from '../../config/supportedRegions.json';
import {
    ACTIVE_LOAN,
    CAPITAL_STATE_ACTIVE,
    CAPITAL_STATE_ELIGIBLE_LOAN,
    CAPITAL_STATE_FIRST_TIME_ELIGIBLE_LOAN,
    CAPITAL_STATE_GRANTS_LOAN,
    CAPITAL_STATE_INELIGIBLE,
    CAPITAL_STATE_PENDING_LOAN,
    CAPITAL_STATE_RENEWABLE_LOAN,
    CAPITAL_STATE_UNSUPPORTED_REGION,
} from '../../../../mocks/mock-data';
import { getEnhancedCapitalState, shouldGetGrants, getRenewableGrantDetails } from './state';

describe('getEnhancedCapitalState', () => {
    test('returns undefined when no capital state is available', () => {
        expect(getEnhancedCapitalState(undefined, localSupportedRegions)).toBeUndefined();
    });

    test('returns dynamic offer when there are no ongoing grants or there is a valid renewal', () => {
        expect(getEnhancedCapitalState(CAPITAL_STATE_INELIGIBLE, localSupportedRegions)).toMatchObject({ dynamicOfferConfig: undefined });
        expect(getEnhancedCapitalState(CAPITAL_STATE_FIRST_TIME_ELIGIBLE_LOAN, localSupportedRegions)).toMatchObject({
            dynamicOfferConfig: CAPITAL_STATE_FIRST_TIME_ELIGIBLE_LOAN.dynamicOffer,
        });
        expect(getEnhancedCapitalState(CAPITAL_STATE_PENDING_LOAN, localSupportedRegions)).toMatchObject({ dynamicOfferConfig: undefined });
        expect(getEnhancedCapitalState(CAPITAL_STATE_ACTIVE, localSupportedRegions)).toMatchObject({ dynamicOfferConfig: undefined });
        expect(getEnhancedCapitalState(CAPITAL_STATE_RENEWABLE_LOAN, localSupportedRegions)).toMatchObject({
            dynamicOfferConfig: CAPITAL_STATE_RENEWABLE_LOAN.dynamicOffer,
        });
        expect(getEnhancedCapitalState(CAPITAL_STATE_ELIGIBLE_LOAN, localSupportedRegions)).toMatchObject({
            dynamicOfferConfig: CAPITAL_STATE_ELIGIBLE_LOAN.dynamicOffer,
        });
    });

    test('identifies ongoing and closed grants', () => {
        expect(getEnhancedCapitalState(CAPITAL_STATE_FIRST_TIME_ELIGIBLE_LOAN, localSupportedRegions)).toMatchObject({ hasGrants: false });
        expect(getEnhancedCapitalState(CAPITAL_STATE_PENDING_LOAN, localSupportedRegions)).toMatchObject({ hasGrants: true });
        expect(getEnhancedCapitalState(CAPITAL_STATE_ACTIVE, localSupportedRegions)).toMatchObject({ hasGrants: true });
        expect(getEnhancedCapitalState(CAPITAL_STATE_ELIGIBLE_LOAN, localSupportedRegions)).toMatchObject({ hasGrants: true });
        expect(getEnhancedCapitalState(CAPITAL_STATE_GRANTS_LOAN, localSupportedRegions)).toMatchObject({ hasGrants: true });
    });

    test('identifies whether the legal entity region is supported', () => {
        expect(getEnhancedCapitalState(CAPITAL_STATE_UNSUPPORTED_REGION, localSupportedRegions)).toMatchObject({ isRegionSupported: false });
        expect(getEnhancedCapitalState(CAPITAL_STATE_GRANTS_LOAN, localSupportedRegions)).toMatchObject({ isRegionSupported: true });
    });

    test('returns the legal entity region', () => {
        expect(getEnhancedCapitalState(CAPITAL_STATE_UNSUPPORTED_REGION, localSupportedRegions)).toMatchObject({
            region: CAPITAL_STATE_UNSUPPORTED_REGION.legalEntity?.region,
        });
        expect(getEnhancedCapitalState(CAPITAL_STATE_GRANTS_LOAN, localSupportedRegions)).toMatchObject({
            region: CAPITAL_STATE_GRANTS_LOAN.legalEntity?.region,
        });
    });

    test('marks grant as renewable when minimum renewal amount is less than offer minimum', () => {
        expect(getEnhancedCapitalState(CAPITAL_STATE_RENEWABLE_LOAN, localSupportedRegions)).toMatchObject({
            renewableGrants: [CAPITAL_STATE_RENEWABLE_LOAN.activeOrPendingGrants[0]],
        });
        expect(getEnhancedCapitalState(CAPITAL_STATE_ACTIVE, localSupportedRegions)).toMatchObject({ renewableGrants: [] });
    });

    test('marks grant as renewable when minimum renewal amount equals the offer maximum', () => {
        const state = {
            ...CAPITAL_STATE_RENEWABLE_LOAN,
            activeOrPendingGrants: [
                {
                    ...CAPITAL_STATE_RENEWABLE_LOAN.activeOrPendingGrants[0]!,
                    renewal: {
                        eligible: true,
                        minimumRenewalAmount: { value: 2500000, currency: 'EUR' },
                    },
                },
            ],
        };

        expect(getEnhancedCapitalState(state, localSupportedRegions)).toMatchObject({
            dynamicOfferConfig: CAPITAL_STATE_RENEWABLE_LOAN.dynamicOffer,
            renewableGrants: state.activeOrPendingGrants,
        });
    });

    test('marks grant as nonrenewable when minimum renewal amount exceeds the offer maximum', () => {
        const state = {
            ...CAPITAL_STATE_RENEWABLE_LOAN,
            activeOrPendingGrants: [
                {
                    ...CAPITAL_STATE_RENEWABLE_LOAN.activeOrPendingGrants[0]!,
                    renewal: {
                        eligible: true,
                        minimumRenewalAmount: { value: 2500001, currency: 'EUR' },
                    },
                },
            ],
        };

        expect(getEnhancedCapitalState(state, localSupportedRegions)).toMatchObject({
            dynamicOfferConfig: undefined,
            renewableGrants: [],
        });
    });

    test('identifies grants that are already being renewed', () => {
        expect(getEnhancedCapitalState(CAPITAL_STATE_GRANTS_LOAN, localSupportedRegions)).toMatchObject({
            renewsGrantIds: new Set([CAPITAL_STATE_GRANTS_LOAN.activeOrPendingGrants[0]!.renewsGrantId]),
        });
        expect(getEnhancedCapitalState(CAPITAL_STATE_ACTIVE, localSupportedRegions)).toMatchObject({ renewsGrantIds: new Set() });
    });
});

describe('shouldGetGrants', () => {
    test('permits grants retrieval only when there are grants on server and region is supported', () => {
        expect(shouldGetGrants(CAPITAL_STATE_ACTIVE, true)).toBe(true);
        expect(shouldGetGrants(CAPITAL_STATE_ELIGIBLE_LOAN, true)).toBe(true);
        expect(shouldGetGrants(CAPITAL_STATE_FIRST_TIME_ELIGIBLE_LOAN, true)).toBe(false);
        expect(shouldGetGrants(CAPITAL_STATE_ACTIVE, false)).toBe(false);
        expect(shouldGetGrants(undefined, true)).toBe(false);
    });
});

describe('getRenewableGrantDetails', () => {
    test('returns a renewable grant with reduced fields', () => {
        const state = getEnhancedCapitalState(CAPITAL_STATE_RENEWABLE_LOAN, localSupportedRegions)!;
        expect(getRenewableGrantDetails(state)).toEqual({
            expectedRepaymentPeriodDays: 360,
            feesAmount: ACTIVE_LOAN.feesAmount,
            grantAmount: ACTIVE_LOAN.grantAmount,
            maximumRepaymentPeriodDays: 450,
            repaymentRate: 1500,
            thresholdAmount: ACTIVE_LOAN.thresholdAmount,
            totalAmount: ACTIVE_LOAN.totalAmount,
        });
    });

    test('returns undefined when there is no renewable grant', () => {
        expect(getRenewableGrantDetails(getEnhancedCapitalState(CAPITAL_STATE_FIRST_TIME_ELIGIBLE_LOAN, localSupportedRegions)!)).toBeUndefined();
    });
});
