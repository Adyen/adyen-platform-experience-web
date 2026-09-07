import { describe, expect, test } from 'vitest';
import {
    CAPITAL_STATE_FIRST_OFFER,
    CAPITAL_STATE_INELIGIBLE,
    CAPITAL_STATE_RENEWABLE_GRANT,
    DYNAMIC_CAPITAL_OFFER,
} from '../../../../mocks/mock-data/capital';
import { getEnhancedCapitalState } from '../../shared';
import { getDynamicOfferConfig, getEstimatedTerms, getCurrency, getDefaultAmountValue } from './dynamicOfferConfig';

describe('getDynamicOfferConfig', () => {
    test('returns config with adjusted minimum amount when there is a renewable grant with minimum renewal amount greater than minimum config amount', () => {
        const state = getEnhancedCapitalState(CAPITAL_STATE_RENEWABLE_GRANT, ['EU'])!;
        expect(getDynamicOfferConfig(state)).toMatchObject({
            minAmount: { value: 1220000, currency: 'EUR' },
        });
    });

    test('returns original config when there is a renewable grant with minimum renewal amount less than minimum config amount', () => {
        const state = getEnhancedCapitalState(
            {
                ...CAPITAL_STATE_RENEWABLE_GRANT,
                activeOrPendingGrants: [
                    {
                        ...CAPITAL_STATE_RENEWABLE_GRANT.activeOrPendingGrants[0]!,
                        renewal: {
                            eligible: true,
                            minimumRenewalAmount: { value: 50000, currency: 'EUR' },
                        },
                    },
                ],
            },
            ['EU']
        )!;

        expect(getDynamicOfferConfig(state)).toEqual(DYNAMIC_CAPITAL_OFFER);
    });

    test('returns original config when there is no renewable grant', () => {
        const state = getEnhancedCapitalState(CAPITAL_STATE_FIRST_OFFER, ['EU'])!;
        expect(getDynamicOfferConfig(state)).toBe(DYNAMIC_CAPITAL_OFFER);
    });

    test('returns undefined when no dynamic offer is available', () => {
        const state = getEnhancedCapitalState(CAPITAL_STATE_INELIGIBLE, ['EU'])!;
        expect(getDynamicOfferConfig(state)).toBeUndefined();
    });
});

describe('getCurrency', () => {
    test('returns the dynamic offer currency', () => {
        expect(getCurrency(DYNAMIC_CAPITAL_OFFER)).toBe('EUR');
    });
});

describe('getDefaultAmountValue', () => {
    test('returns the midpoint of the amount range', () => {
        expect(getDefaultAmountValue(DYNAMIC_CAPITAL_OFFER)).toBe(1300000);
    });

    test('keeps a rounded midpoint within the configured range', () => {
        const config = {
            ...DYNAMIC_CAPITAL_OFFER,
            minAmount: { value: 101, currency: 'EUR' },
            maxAmount: { value: 150, currency: 'EUR' },
            step: 100,
        };

        expect(getDefaultAmountValue(config)).toBe(101);
    });
});

describe('getEstimatedTerms', () => {
    test('returns sorted estimated terms', () => {
        const config = { ...DYNAMIC_CAPITAL_OFFER, estimatedRepaymentTermsInDays: [360, 90, 180] };
        expect(getEstimatedTerms(config)).toEqual([90, 180, 360]);
        expect(config.estimatedRepaymentTermsInDays).toEqual([360, 90, 180]);
    });

    test('returns an empty array when there are no terms', () => {
        expect(getEstimatedTerms({ ...DYNAMIC_CAPITAL_OFFER, estimatedRepaymentTermsInDays: [] })).toEqual([]);
    });
});
