import { describe, expect, test } from 'vitest';
import Localization from '@integration-components/core/Localization';
import { getPaymentDetailsItems } from './paymentDetailsItems';
import type { TransactionDetails, TransactionDetailsCustomization } from './types';

const { i18n } = new Localization();

const buildTransaction = (overrides: Record<string, unknown> = {}) =>
    ({
        id: 'TX_ID',
        category: 'Payment',
        balanceAccount: { id: 'BA_ID', description: 'Main account' },
        merchantReference: 'MERCHANT_REF',
        paymentPspReference: 'PSP_REF',
        ...overrides,
    }) as unknown as TransactionDetails;

const buildRefund = (refundMetadata: Record<string, unknown> = {}) =>
    buildTransaction({
        category: 'Refund',
        refundMetadata: { refundReason: 'requested_by_customer', refundPspReference: 'REFUND_PSP_REF', ...refundMetadata },
    });

const hide = (...keys: string[]) => ({ fields: keys.map(key => ({ key, visibility: 'hidden' })) }) as unknown as TransactionDetailsCustomization;

const getIds = (...args: Parameters<typeof getPaymentDetailsItems> extends [unknown, ...infer Rest] ? Rest : never) =>
    getPaymentDetailsItems(i18n, ...args).map(item => item.id);

describe('getPaymentDetailsItems', () => {
    test('lists the account, reference ID, merchant reference and PSP reference of a payment', () => {
        expect(getPaymentDetailsItems(i18n, buildTransaction())).toEqual([
            { id: 'account', key: 'transactions.details.fields.account', value: 'Main account' },
            {
                id: 'id',
                key: 'transactions.details.fields.referenceID',
                value: 'TX_ID',
                copyable: true,
                copyAriaLabelKey: 'transactions.details.copy.referenceID',
                trackingName: 'Reference ID',
            },
            {
                id: 'merchantReference',
                key: 'transactions.details.fields.merchantReference',
                value: 'MERCHANT_REF',
                copyable: true,
                copyAriaLabelKey: 'transactions.details.copy.merchantReference',
                trackingName: 'Merchant reference',
            },
            {
                id: 'paymentPspReference',
                key: 'transactions.details.fields.pspReference',
                value: 'PSP_REF',
                copyable: true,
                copyAriaLabelKey: 'transactions.details.copy.pspReference',
                trackingName: 'PSP reference',
            },
        ]);
    });

    test('uses the balance account ID when it has no description', () => {
        const transaction = buildTransaction({ balanceAccount: { id: 'BA_ID' } });
        expect(getPaymentDetailsItems(i18n, transaction)[0]).toMatchObject({ id: 'account', value: 'BA_ID' });
    });

    test('skips the account, merchant reference and PSP reference when they are missing', () => {
        const transaction = buildTransaction({ balanceAccount: undefined, merchantReference: undefined, paymentPspReference: undefined });
        expect(getIds(transaction)).toEqual(['id']);
    });

    test('adds the refund reason and refund PSP reference for refunds, in their fixed positions', () => {
        expect(getIds(buildRefund())).toEqual(['account', 'refundReason', 'id', 'merchantReference', 'paymentPspReference', 'refundPspReference']);
    });

    test('translates the refund reason', () => {
        const refundReason = getPaymentDetailsItems(i18n, buildRefund()).find(item => item.id === 'refundReason');
        expect(refundReason?.value).toBe('Requested by customer');
    });

    test('keeps an unknown refund reason as it is', () => {
        const refundReason = getPaymentDetailsItems(i18n, buildRefund({ refundReason: 'something_else' })).find(item => item.id === 'refundReason');
        expect(refundReason?.value).toBe('something_else');
    });

    test('skips the refund fields when the refund metadata does not have them', () => {
        expect(getIds(buildRefund({ refundReason: undefined, refundPspReference: undefined }))).toEqual([
            'account',
            'id',
            'merchantReference',
            'paymentPspReference',
        ]);
    });

    test('ignores refund metadata on transactions that are not refunds', () => {
        const transaction = buildTransaction({ refundMetadata: { refundReason: 'fraudulent', refundPspReference: 'REFUND_PSP_REF' } });
        expect(getIds(transaction)).toEqual(['account', 'id', 'merchantReference', 'paymentPspReference']);
    });

    test('only the refund fields are not copyable', () => {
        const copyable = getPaymentDetailsItems(i18n, buildRefund()).filter(item => item.copyable);
        expect(copyable.map(item => item.id)).toEqual(['id', 'merchantReference', 'paymentPspReference']);
    });

    describe('with data customization', () => {
        test('keeps all fields when the customization has no hidden fields', () => {
            const customization = {
                fields: [{ key: 'account', visibility: 'visible' }, 'merchantReference'],
            } as unknown as TransactionDetailsCustomization;
            expect(getIds(buildTransaction(), customization)).toEqual(['account', 'id', 'merchantReference', 'paymentPspReference']);
        });

        test('hides fields marked as hidden', () => {
            expect(getIds(buildRefund(), hide('id', 'refundReason'))).toEqual([
                'account',
                'merchantReference',
                'paymentPspReference',
                'refundPspReference',
            ]);
        });

        test('hides the account through the balanceAccount alias', () => {
            expect(getIds(buildTransaction(), hide('balanceAccount'))).not.toContain('account');
        });

        test('hides the account through the description alias only when the balance account has a description', () => {
            expect(getIds(buildTransaction(), hide('description'))).not.toContain('account');

            const withoutDescription = buildTransaction({ balanceAccount: { id: 'BA_ID' } });
            expect(getIds(withoutDescription, hide('description'))).toContain('account');
        });

        test('hides the account through the balanceAccountId alias only when the balance account has no description', () => {
            expect(getIds(buildTransaction(), hide('balanceAccountId'))).toContain('account');

            const withoutDescription = buildTransaction({ balanceAccount: { id: 'BA_ID' } });
            expect(getIds(withoutDescription, hide('balanceAccountId'))).not.toContain('account');
        });
    });
});
