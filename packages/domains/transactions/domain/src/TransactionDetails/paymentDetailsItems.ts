import type Localization from '@integration-components/core/Localization';
import { normalizeCustomFields } from '@integration-components/utils';
import { TX_DETAILS_FIELDS_REMAPS } from './constants';
import { getTransactionRefundReason } from './translations';
import type { TransactionDetails, TransactionDetailsCustomization } from './types';
import type { TransactionsTranslationKey } from '../shared/types';

export interface PaymentDetailsItem {
    id: string;
    key: TransactionsTranslationKey;
    value: string;
    copyable?: boolean;
    copyAriaLabelKey?: TransactionsTranslationKey;
    trackingName?: string;
}

export const getPaymentDetailsItems = (
    i18n: Localization['i18n'],
    transaction: TransactionDetails,
    customization?: TransactionDetailsCustomization
): PaymentDetailsItem[] => {
    const { balanceAccount, category, id, merchantReference, paymentPspReference, refundMetadata } = transaction;
    const account = balanceAccount?.description || balanceAccount?.id;
    const isRefund = category === 'Refund';
    const refundReason = isRefund ? refundMetadata?.refundReason : undefined;
    const refundPspReference = isRefund ? refundMetadata?.refundPspReference : undefined;

    const customizedFields = normalizeCustomFields(customization?.fields, TX_DETAILS_FIELDS_REMAPS, transaction);
    const isVisible = (fieldId: string) => !customizedFields || customizedFields.find(f => f.key === fieldId)?.visibility !== 'hidden';

    const rows: [hasValue: boolean, item: PaymentDetailsItem][] = [
        [!!account, { id: 'account', key: 'transactions.details.fields.account', value: account as string }],
        [
            !!refundReason,
            {
                id: 'refundReason',
                key: 'transactions.details.fields.refundReason',
                value: refundReason ? (getTransactionRefundReason(i18n, refundReason) as string) : '',
            },
        ],
        [
            true,
            {
                id: 'id',
                key: 'transactions.details.fields.referenceID',
                value: id,
                copyable: true,
                copyAriaLabelKey: 'transactions.details.actions.copyReferenceID',
                trackingName: 'Reference ID',
            },
        ],
        [
            !!merchantReference,
            {
                id: 'merchantReference',
                key: 'transactions.details.fields.merchantReference',
                value: merchantReference as string,
                copyable: true,
                copyAriaLabelKey: 'transactions.details.actions.copyMerchantReference',
                trackingName: 'Merchant reference',
            },
        ],
        [
            !!paymentPspReference,
            {
                id: 'paymentPspReference',
                key: 'transactions.details.fields.pspReference',
                value: paymentPspReference as string,
                copyable: true,
                copyAriaLabelKey: 'transactions.details.actions.copyPspReference',
                trackingName: 'PSP reference',
            },
        ],
        [
            !!refundPspReference,
            { id: 'refundPspReference', key: 'transactions.details.fields.refundPspReference', value: refundPspReference as string },
        ],
    ];

    return rows.filter(([hasValue, item]) => hasValue && isVisible(item.id)).map(([, item]) => item);
};
