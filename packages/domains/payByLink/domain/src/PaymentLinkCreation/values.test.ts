import { describe, expect, test } from 'vitest';
import { buildApiPayload } from './values';

describe('buildApiPayload', () => {
    test('converts numeric form values before building the API payload', () => {
        const result = buildApiPayload(
            {
                store: 'store-id',
                'amount.value': '1500',
                'amount.currency': 'EUR',
                'linkValidity.quantity': '90',
                'linkValidity.durationUnit': 'day',
            },
            ['amount.value', 'amount.currency', 'linkValidity.quantity', 'linkValidity.durationUnit']
        );

        expect(result).toEqual({
            store: 'store-id',
            payload: {
                amount: { value: 1500, currency: 'EUR' },
                linkValidity: { quantity: 90, durationUnit: 'day' },
            },
        });
    });
});
