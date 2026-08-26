import { describe, expect, test } from 'vitest';
import { getRenewalAmountBreakdown } from './renewal';

describe('getRenewalAmountBreakdown', () => {
    test('returns a breakdown of amounts related to a grant renewal', () => {
        expect(getRenewalAmountBreakdown(200000, { value: 80000, currency: 'EUR' })).toEqual({
            amountToReceive: 120000,
            currency: 'EUR',
            newGrantAmountValue: 200000,
            remainingGrantAmountValue: 80000,
        });
    });
});
