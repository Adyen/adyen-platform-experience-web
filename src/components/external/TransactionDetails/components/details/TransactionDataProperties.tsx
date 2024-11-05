import { useMemo } from 'preact/hooks';
import { TX_DATA_LABEL, TX_DATA_LIST, TX_DETAILS_RESERVED_FIELDS_SET } from '../constants';
import { _isCustomDataObject } from '../../../../internal/DataGrid/components/TableCells';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useTransactionDetailsContext from '../../context/details';
import StructuredList from '../../../../internal/StructuredList';
import { StructuredListProps } from '../../../../internal/StructuredList/types';
import { TranslationKey } from '../../../../../translations';
import { isNullish } from '../../../../../utils';

const TransactionDataProperties = () => {
    const { i18n } = useCoreContext();
    const { transaction } = useTransactionDetailsContext();

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

        // [TODO]: Add translation entries for the following tokens and substitute here:
        //   'Fee' | 'Original amount' | 'Original payment' | 'Payment PSP Reference' | 'PSP Reference' | 'Refund fee'
        const deductedAmountKey = isRefundTransaction ? ('Refund fee' as TranslationKey) : ('Fee' as TranslationKey);
        const originalAmountKey = isRefundTransaction ? ('Original payment' as TranslationKey) : ('Original amount' as TranslationKey);
        const paymentReferenceKey = isRefundTransaction ? ('Payment PSP Reference' as TranslationKey) : ('PSP Reference' as TranslationKey);

        const listItems: StructuredListProps['items'] = [
            // amounts
            originalAmount ? { key: originalAmountKey, value: originalAmount } : SKIP_ITEM,
            deductedAmount ? { key: deductedAmountKey, value: deductedAmount } : SKIP_ITEM,

            // balance account
            balanceAccount?.description ? { key: 'account' as const, value: balanceAccount.description } : SKIP_ITEM,

            // custom data
            ...Object.entries(transaction)
                .filter(([key]) => !TX_DETAILS_RESERVED_FIELDS_SET.has(key as any))
                .map(([key, value]) => ({
                    key: key as TranslationKey,
                    value: _isCustomDataObject(value) ? value.value : value,
                })),

            // refund reason
            isRefundTransaction && refundMetadata?.refundReason
                ? { key: 'refundReason' as const, value: i18n.get(refundMetadata.refundReason as TranslationKey) }
                : SKIP_ITEM,

            // ids
            { key: 'referenceID' as const, value: id },

            // refund psp reference
            // [TODO]: Add translation entries for the following tokens and substitute here:
            //   'Refund PSP Reference'
            isRefundTransaction && refundMetadata?.refundPspReference
                ? { key: 'Refund PSP Reference' as TranslationKey, value: refundMetadata.refundPspReference }
                : SKIP_ITEM,

            // psp reference
            paymentPspReference ? { key: paymentReferenceKey, value: paymentPspReference } : SKIP_ITEM,
        ].filter(Boolean);

        return (
            <StructuredList
                className={TX_DATA_LIST}
                items={listItems}
                layout="5-7"
                renderLabel={label => <div className={TX_DATA_LABEL}>{label}</div>}
            />
        );
    }, [i18n, transaction]);
};

export default TransactionDataProperties;
