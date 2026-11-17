import { describe, expect, test } from 'vitest';
import { parsePietAction } from './actions';

describe('parsePietAction', () => {
    test.each([
        [
            { type: 'refundTransaction', id: 'EVJN42' },
            { type: 'refundTransaction', transactionId: 'EVJN42' },
        ],
        [
            { type: 'manageDispute', id: ' CB123 ' },
            { type: 'manageDispute', disputePspReference: 'CB123' },
        ],
        [
            { type: 'expirePaymentLink', id: 'PL1' },
            { type: 'expirePaymentLink', paymentLinkId: 'PL1' },
        ],
        [{ type: 'createPaymentLink' }, { type: 'createPaymentLink' }],
        [
            { type: 'viewTransaction', id: 'EVJN1' },
            { type: 'viewTransaction', transactionId: 'EVJN1' },
        ],
        [
            { type: 'viewDispute', id: 'CB1' },
            { type: 'viewDispute', disputePspReference: 'CB1' },
        ],
        [
            { type: 'viewPaymentLink', id: 'PL1' },
            { type: 'viewPaymentLink', paymentLinkId: 'PL1' },
        ],
        [
            { type: 'viewPayout', id: 'BA1', date: '2026-11-01T10:00:00Z' },
            { type: 'viewPayout', balanceAccountId: 'BA1', date: '2026-11-01T10:00:00Z' },
        ],
    ])('accepts %j', (input, expected) => {
        expect(parsePietAction(input)).toEqual(expected);
    });

    test.each([
        null,
        'refundTransaction',
        3,
        {},
        { type: 'refundTransaction' },
        { type: 'refundTransaction', id: 'a b' },
        { type: 'refundTransaction', id: 5 },
        { type: 'other', id: 'X' },
    ])('rejects %j', input => {
        expect(parsePietAction(input)).toBeUndefined();
    });
});
