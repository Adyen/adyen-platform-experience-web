import { useMemo } from 'preact/hooks';
import CopyText from '../../../../internal/CopyText/CopyText';
import { TX_DATA_LABEL, TX_DATA_LIST, TX_DETAILS_RESERVED_FIELDS_SET } from '../constants';
import { _isCustomDataObject } from '../../../../internal/DataGrid/components/TableCells';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useTransactionDetailsContext from '../../context/details';
import StructuredList from '../../../../internal/StructuredList';
import { StructuredListProps } from '../../../../internal/StructuredList/types';
import { TranslationKey } from '../../../../../translations';
import { isNullish } from '../../../../../utils';
import Link from '../../../../internal/Link/Link';

const TransactionDataProperties = () => {
    const { i18n } = useCoreContext();
    const { transaction, extraFields } = useTransactionDetailsContext();

    return useMemo(() => {
        const { balanceAccount, category, id, paymentPspReference, refundMetadata } = transaction;
        const isRefundTransaction = category === 'Refund';
        const SKIP_ITEM: StructuredListProps['items'][number] = null!;

        const getFormattedAmount = (amount?: (typeof transaction)['amount']) => {
            if (isNullish(amount)) return null;
            const { value, currency } = amount;
            return i18n.amount(value, currency);
        };

        const deductedAmount = getFormattedAmount(transaction.deductedAmount);
        const originalAmount = getFormattedAmount(transaction.originalAmount);

        const deductedAmountKey = isRefundTransaction ? 'refund.refundFee' : 'refund.fee';
        const originalAmountKey = isRefundTransaction ? 'refund.originalPayment' : 'refund.originalAmount';
        const paymentReferenceKey = isRefundTransaction ? 'refund.paymentPspReference' : 'refund.pspReference';

        const listItems: StructuredListProps['items'] = [
            // amounts
            originalAmount ? { key: originalAmountKey as TranslationKey, value: originalAmount } : SKIP_ITEM,
            deductedAmount ? { key: deductedAmountKey as TranslationKey, value: deductedAmount } : SKIP_ITEM,

            // balance account
            balanceAccount?.description ? { key: 'account' as const, value: balanceAccount.description } : SKIP_ITEM,

            // custom data
            ...(Object.entries(extraFields || {})
                .filter(([key]) => !TX_DETAILS_RESERVED_FIELDS_SET.has(key as any))
                .map(([key, value]) => ({
                    key: key as TranslationKey,
                    value: _isCustomDataObject(value) ? value.value : value,
                    type: _isCustomDataObject(value) ? value.type : 'text',
                    details: _isCustomDataObject(value) ? value.details : undefined,
                })) || {}),

            // refund reason
            isRefundTransaction && refundMetadata?.refundReason
                ? {
                      key: 'refundReason' as const,
                      value: i18n.has(`refundReason.${refundMetadata.refundReason}` as TranslationKey)
                          ? i18n.get(`refundReason.${refundMetadata.refundReason}` as TranslationKey)
                          : refundMetadata.refundReason,
                  }
                : SKIP_ITEM,

            // reference id
            { key: 'referenceID' as const, value: <CopyText type={'Default'} textToCopy={id} showCopyTextTooltip={false} /> },

            isRefundTransaction && refundMetadata?.refundPspReference
                ? { key: 'refund.refundPspReference' as TranslationKey, value: refundMetadata.refundPspReference }
                : SKIP_ITEM,

            // psp reference
            paymentPspReference ? { key: paymentReferenceKey as TranslationKey, value: paymentPspReference } : SKIP_ITEM,
        ].filter(Boolean);

        return (
            <StructuredList
                classNames={TX_DATA_LIST}
                items={listItems}
                layout="5-7"
                renderLabel={label => <div className={TX_DATA_LABEL}>{label}</div>}
                renderValue={(val, key, type, details) => {
                    if (type === 'link')
                        return (
                            <Link href={details.href} target={details.target || '_blank'}>
                                {val}
                            </Link>
                        );
                    return val;
                }}
            />
        );
    }, [extraFields, i18n, transaction]);
};

export default TransactionDataProperties;
