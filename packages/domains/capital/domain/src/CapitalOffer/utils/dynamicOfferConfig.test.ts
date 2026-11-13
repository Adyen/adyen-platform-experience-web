import { describe, expect, test } from 'vitest';
import {
    CAPITAL_STATE_FIRST_TIME_ELIGIBLE_LOAN,
    CAPITAL_STATE_INELIGIBLE,
    CAPITAL_STATE_RENEWABLE_LOAN,
    DYNAMIC_OFFER_CONFIG_LOAN,
} from '../../../../mocks/mock-data';
import { getEnhancedCapitalState } from '../../shared';
import { getDynamicOfferConfig, getEstimatedTerms, getCurrency, getDefaultAmountValue } from './dynamicOfferConfig';

describe('getDynamicOfferConfig', () => {
    test('returns config with adjusted minimum amount when there is a renewable grant with minimum renewal amount greater than minimum config amount', () => {
        const state = getEnhancedCapitalState(CAPITAL_STATE_RENEWABLE_LOAN, ['EU'])!;
        expect(getDynamicOfferConfig(state)).toMatchObject({
            minAmount: { value: 1220000, currency: 'EUR' },
        });
    });

    test('returns original config when there is a renewable grant with minimum renewal amount less than minimum config amount', () => {
        const state = getEnhancedCapitalState(
            {
                ...CAPITAL_STATE_RENEWABLE_LOAN,
                activeOrPendingGrants: [
                    {
                        ...CAPITAL_STATE_RENEWABLE_LOAN.activeOrPendingGrants[0]!,
                        renewal: {
                            eligible: true,
                            minimumRenewalAmount: { value: 50000, currency: 'EUR' },
                        },
                    },
                ],
            },
            ['EU']
        )!;

        expect(getDynamicOfferConfig(state)).toEqual(DYNAMIC_OFFER_CONFIG_LOAN);
    });

    test('returns original config when there is no renewable grant', () => {
        const state = getEnhancedCapitalState(CAPITAL_STATE_FIRST_TIME_ELIGIBLE_LOAN, ['EU'])!;
        expect(getDynamicOfferConfig(state)).toBe(DYNAMIC_OFFER_CONFIG_LOAN);
    });

    test('returns undefined when no dynamic offer is available', () => {
        const state = getEnhancedCapitalState(CAPITAL_STATE_INELIGIBLE, ['EU'])!;
        expect(getDynamicOfferConfig(state)).toBeUndefined();
    });
});

describe('getCurrency', () => {
    test('returns the dynamic offer currency', () => {
        expect(getCurrency(DYNAMIC_OFFER_CONFIG_LOAN)).toBe('EUR');
    });
});

describe('getDefaultAmountValue', () => {
    test('returns the midpoint of the amount range', () => {
        expect(getDefaultAmountValue(DYNAMIC_OFFER_CONFIG_LOAN)).toBe(1300000);
    });

    test('keeps a rounded midpoint within the configured range', () => {
        const config = {
            ...DYNAMIC_OFFER_CONFIG_LOAN,
            minAmount: { value: 101, currency: 'EUR' },
            maxAmount: { value: 150, currency: 'EUR' },
            step: 100,
        };

        expect(getDefaultAmountValue(config)).toBe(101);
    });
});

describe('getEstimatedTerms', () => {
    test('returns sorted estimated terms', () => {
        const config = { ...DYNAMIC_OFFER_CONFIG_LOAN, estimatedRepaymentTermsInDays: [360, 90, 180] };
        expect(getEstimatedTerms(config)).toEqual([90, 180, 360]);
        expect(config.estimatedRepaymentTermsInDays).toEqual([360, 90, 180]);
    });

    test('returns an empty array when there are no terms', () => {
        expect(getEstimatedTerms({ ...DYNAMIC_OFFER_CONFIG_LOAN, estimatedRepaymentTermsInDays: [] })).toEqual([]);
    });
});
