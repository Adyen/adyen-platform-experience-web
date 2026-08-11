import { describe, expect, test } from 'vitest';
import type { IGrantOfferResponseDTO } from '@integration-components/types';
import { adjustSelectedTerm, getAvailableTerms, getCreateGrantOfferBody, getDefaultTerm, getOfferForTerm, getOffersByTerm } from './offers';

const OFFER_90_DAYS = {
    aprBasisPoints: 1200,
    expectedRepaymentPeriodDays: 90,
    feesAmount: { value: 1000, currency: 'EUR' },
    grantAmount: { value: 100000, currency: 'EUR' },
    id: 'offer-90',
    maximumRepaymentPeriodDays: 120,
    repaymentRate: 1500,
    thresholdAmount: { value: 5000, currency: 'EUR' },
    totalAmount: { value: 101000, currency: 'EUR' },
} satisfies IGrantOfferResponseDTO;

const OFFER_180_DAYS = {
    ...OFFER_90_DAYS,
    expectedRepaymentPeriodDays: 180,
    id: 'offer-180',
} satisfies IGrantOfferResponseDTO;

describe('getOffersByTerm', () => {
    test('returns offers indexed by term', () => {
        const offersByTerm = getOffersByTerm([OFFER_90_DAYS, OFFER_180_DAYS]);
        expect(offersByTerm).toEqual({
            90: OFFER_90_DAYS,
            180: OFFER_180_DAYS,
        });
    });
});

describe('getAvailableTerms', () => {
    test('returns available terms', () => {
        const offersByTerm = getOffersByTerm([OFFER_90_DAYS, OFFER_180_DAYS]);
        expect(getAvailableTerms(offersByTerm)).toEqual([90, 180]);
    });

    test('returns no terms for an empty offers map', () => {
        expect(getAvailableTerms({})).toEqual([]);
    });
});

describe('getDefaultTerm', () => {
    test('returns default term', () => {
        expect(getDefaultTerm([90, 180])).toBe(180);
        expect(getDefaultTerm([90, 360])).toBe(90);
    });

    test('returns undefined when there are no available terms', () => {
        expect(getDefaultTerm([])).toBeUndefined();
    });
});

describe('adjustSelectedTerm', () => {
    test('returns the nearest available term when selected term is not available', () => {
        expect(adjustSelectedTerm([90, 180], 360)).toBe(180);
    });

    test('returns the first nearest term when there are multiple equally-near terms', () => {
        expect(adjustSelectedTerm([90, 270], 180)).toBe(90);
    });
});

describe('getOfferForTerm', () => {
    test('returns the offer that matches the provided term', () => {
        const offersByTerm = getOffersByTerm([OFFER_90_DAYS, OFFER_180_DAYS]);
        expect(getOfferForTerm(offersByTerm, 90)).toBe(OFFER_90_DAYS);
        expect(getOfferForTerm(offersByTerm, 360)).toBeUndefined();
    });
});

describe('getCreateGrantOfferBody', () => {
    test('returns createGrantOffer request body based on provided offer', () => {
        expect(getCreateGrantOfferBody(OFFER_180_DAYS)).toEqual({
            amount: 100000,
            currency: 'EUR',
            selectedEstimatedRepaymentTermDays: 180,
        });
    });
});
