import { describe, expect, test } from 'vitest';
import Localization from '@integration-components/core/Localization';
import type { IDisputeDetail } from '@integration-components/types/api/models/disputes';
import defenseReasonConfig from '../config/defenseReasonConfig.json';
import { getDisputeDetailItems } from './detailItems';

const { i18n } = new Localization();

// Far enough in the future that a dispute due on this date is never past its deadline.
const FUTURE_DUE_DATE = '2999-01-01T00:00:00.000Z';

type Overrides = {
    dispute?: Record<string, unknown>;
    payment?: Record<string, unknown>;
    defense?: Record<string, unknown> | null;
};

const buildDispute = ({ dispute, payment, defense }: Overrides = {}) =>
    ({
        dispute: {
            pspReference: 'DISPUTE_REF',
            status: 'UNDEFENDED',
            type: 'CHARGEBACK',
            createdAt: '2026-01-01T10:00:00.000Z',
            dueDate: FUTURE_DUE_DATE,
            reason: { category: 'FRAUD', code: '10.4', title: 'Other Fraud' },
            ...dispute,
        },
        payment: {
            pspReference: 'PAYMENT_REF',
            merchantReference: 'MERCHANT_REF',
            balanceAccount: { description: 'Main account' },
            ...payment,
        },
        ...(defense === null ? {} : { defense }),
    }) as unknown as IDisputeDetail;

const getIds = (overrides?: Overrides) => getDisputeDetailItems(i18n, buildDispute(overrides), defenseReasonConfig).map(item => item.id);
const getItem = (id: string, overrides?: Overrides) =>
    getDisputeDetailItems(i18n, buildDispute(overrides), defenseReasonConfig).find(item => item.id === id);

describe('getDisputeDetailItems', () => {
    test('lists the base fields of an open dispute in order', () => {
        expect(getIds()).toEqual([
            'disputeReason',
            'reasonCode',
            'openedOn',
            'respondBy',
            'disputeId',
            'account',
            'paymentPspReference',
            'paymentMerchantReference',
        ]);
    });

    test('combines the dispute reason category and title', () => {
        expect(getItem('disputeReason')).toMatchObject({ kind: 'text', value: 'Fraud - Other Fraud' });
    });

    test('maps text and date values', () => {
        expect(getItem('reasonCode')).toMatchObject({ kind: 'text', value: '10.4' });
        expect(getItem('openedOn')).toMatchObject({ kind: 'date', value: '2026-01-01T10:00:00.000Z' });
        expect(getItem('respondBy')).toMatchObject({ kind: 'date', value: FUTURE_DUE_DATE });
        expect(getItem('disputeId')).toMatchObject({ kind: 'text', value: 'DISPUTE_REF' });
        expect(getItem('paymentPspReference')).toMatchObject({ kind: 'text', value: 'PAYMENT_REF' });
    });

    test('keeps the account row when the balance account has no description', () => {
        expect(getItem('account', { payment: { balanceAccount: undefined } })).toMatchObject({ kind: 'text', value: undefined });
    });

    test('skips the reason code for fraud notifications', () => {
        expect(getIds({ dispute: { type: 'NOTIFICATION_OF_FRAUD' } })).not.toContain('reasonCode');
    });

    test('skips the merchant reference when the payment has none', () => {
        expect(getIds({ payment: { merchantReference: undefined } })).not.toContain('paymentMerchantReference');
    });

    describe('respond by date', () => {
        test('is skipped when the dispute has no due date', () => {
            expect(getIds({ dispute: { dueDate: undefined } })).not.toContain('respondBy');
        });

        test('is skipped when no action is needed anymore', () => {
            expect(getIds({ dispute: { status: 'WON' } })).not.toContain('respondBy');
        });

        test('is skipped when the dispute is not actionable', () => {
            expect(getIds({ dispute: { defensibility: 'NOT_ACTIONABLE' } })).not.toContain('respondBy');
        });
    });

    describe('defense', () => {
        const defense = { reason: 'NoShowPass', defendedOn: '2026-02-01T10:00:00.000Z', suppliedDocuments: ['DeliveryProof', 'Unknown'] };

        test('adds the defense reason, defended date and evidence after the payment fields', () => {
            expect(getIds({ dispute: { status: 'PENDING' }, defense })).toEqual([
                'disputeReason',
                'reasonCode',
                'openedOn',
                'disputeId',
                'account',
                'paymentPspReference',
                'paymentMerchantReference',
                'defenseReason',
                'defendedOn',
                'disputeEvidence',
            ]);
        });

        test('uses the translated title of a known defense reason', () => {
            const [firstReason] = Object.keys(defenseReasonConfig);
            const item = getItem('defenseReason', { defense: { reason: firstReason } });
            expect(item).toMatchObject({ kind: 'text' });
            expect(item?.value).toBeTruthy();
            expect(item?.value).not.toBe(firstReason);
        });

        test('falls back to the raw value for an unknown defense reason', () => {
            expect(getItem('defenseReason', { defense: { reason: 'SomethingNew' } })).toMatchObject({ kind: 'text', value: 'SomethingNew' });
        });

        test('lists the supplied documents as evidence', () => {
            expect(getItem('disputeEvidence', { defense })).toMatchObject({ kind: 'evidence', value: ['DeliveryProof', 'Unknown'] });
        });

        test('skips the evidence when no document was supplied', () => {
            expect(getIds({ defense: { ...defense, suppliedDocuments: [] } })).not.toContain('disputeEvidence');
        });
    });

    describe('accepted date', () => {
        test.each(['ACCEPTED', 'EXPIRED'])('is shown for %s disputes with an accepted date', status => {
            expect(getItem('acceptedOn', { dispute: { status, acceptedDate: '2026-03-01T10:00:00.000Z' } })).toMatchObject({
                kind: 'date',
                value: '2026-03-01T10:00:00.000Z',
            });
        });

        test('is skipped for other statuses', () => {
            expect(getIds({ dispute: { status: 'WON', acceptedDate: '2026-03-01T10:00:00.000Z' } })).not.toContain('acceptedOn');
        });

        test('is skipped when the dispute has no accepted date', () => {
            expect(getIds({ dispute: { status: 'ACCEPTED' } })).not.toContain('acceptedOn');
        });
    });

    describe('expired date', () => {
        test('is shown for expired disputes', () => {
            expect(getItem('expiredOn', { dispute: { status: 'EXPIRED' } })).toMatchObject({ kind: 'date', value: FUTURE_DUE_DATE });
        });

        test('is shown for lost disputes that were never defended', () => {
            expect(getIds({ dispute: { status: 'LOST' } })).toContain('expiredOn');
        });

        test('is skipped for lost disputes that were defended', () => {
            expect(getIds({ dispute: { status: 'LOST' }, defense: { defendedOn: '2026-02-01T10:00:00.000Z' } })).not.toContain('expiredOn');
        });

        test('is skipped for lost fraud notifications', () => {
            expect(getIds({ dispute: { status: 'LOST', type: 'NOTIFICATION_OF_FRAUD' } })).not.toContain('expiredOn');
        });

        test('is skipped for open disputes', () => {
            expect(getIds()).not.toContain('expiredOn');
        });

        test('is skipped when the dispute has no due date', () => {
            expect(getIds({ dispute: { status: 'EXPIRED', dueDate: undefined } })).not.toContain('expiredOn');
        });
    });
});
