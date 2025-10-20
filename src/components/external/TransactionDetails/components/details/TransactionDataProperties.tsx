import { useCallback, useMemo } from 'preact/hooks';
import CopyText from '../../../../internal/CopyText/CopyText';
import { getTransactionRefundReason } from '../../../../utils/translation/getters';
import { TX_DATA_LABEL, TX_DATA_LIST, TX_DETAILS_RESERVED_FIELDS_SET } from '../constants';
import { isCustomDataObject } from '../../../../internal/DataGrid/components/TableCells';
import useAnalyticsContext from '../../../../../core/Context/analytics/useAnalyticsContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useTransactionDetailsContext from '../../context/details';
import StructuredList from '../../../../internal/StructuredList';
import { StructuredListProps } from '../../../../internal/StructuredList/types';
import { TranslationKey } from '../../../../../translations';
import { isNullish } from '../../../../../utils';
import Link from '../../../../internal/Link/Link';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import Icon from '../../../../internal/DataGrid/components/Icon';
import cx from 'classnames';

const TransactionDataProperties = () => {
    const { i18n } = useCoreContext();
    const { transaction, extraFields, dataCustomization } = useTransactionDetailsContext();
    const userEvents = useAnalyticsContext();

    const onCopyReferenceId = useCallback(() => {
        userEvents.addEvent('Clicked button', {
            label: 'Copy button',
            value: 'referenceID',
            category: 'Transaction component',
            subCategory: 'Transaction details',
        });
    }, [userEvents]);

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

        const deductedAmountKey: TranslationKey = isRefundTransaction ? 'transactions.details.fields.refundFee' : 'transactions.details.fields.fee';
        const originalAmountKey: TranslationKey = isRefundTransaction
            ? 'transactions.details.fields.originalPayment'
            : 'transactions.details.fields.originalAmount';
        const paymentReferenceKey: TranslationKey = isRefundTransaction
            ? 'transactions.details.fields.paymentPspReference'
            : 'transactions.details.fields.pspReference';

        const listItems: StructuredListProps['items'] = [
            // amounts
            originalAmount ? { key: originalAmountKey, value: originalAmount, id: 'originalAmount' } : SKIP_ITEM,
            deductedAmount ? { key: deductedAmountKey, value: deductedAmount, id: 'deductedAmount' } : SKIP_ITEM,

            // balance account
            balanceAccount?.description
                ? { key: 'transactions.details.fields.account' as const, value: balanceAccount.description, id: 'description' }
                : SKIP_ITEM,

            // refund reason
            isRefundTransaction && refundMetadata?.refundReason
                ? {
                      key: 'transactions.details.fields.refundReason' as const,
                      value: getTransactionRefundReason(i18n, refundMetadata.refundReason),
                      id: 'refundReason',
                  }
                : SKIP_ITEM,

            // reference id
            {
                key: 'transactions.details.fields.referenceID' as const,
                value: (
                    <CopyText
                        copyButtonAriaLabelKey="transactions.details.actions.copyReferenceID"
                        type={'Default' as const}
                        textToCopy={id}
                        onCopyText={onCopyReferenceId}
                        showCopyTextTooltip={false}
                    />
                ),
                id: 'id',
            },

            isRefundTransaction && refundMetadata?.refundPspReference
                ? {
                      key: 'transactions.details.fields.refundPspReference' as const,
                      value: refundMetadata.refundPspReference,
                      id: 'refundPspReference',
                  }
                : SKIP_ITEM,

            // psp reference
            paymentPspReference ? { key: paymentReferenceKey, value: paymentPspReference, id: 'paymentPspReference' } : SKIP_ITEM,
        ]
            .filter(Boolean)
            .filter(val => !dataCustomization?.details?.fields?.some(field => field.key === val.id && field.visibility === 'hidden'));

        // Add custom data

        const itemsWithExtraFields = [
            ...listItems,
            ...(Object.entries(extraFields || {})
                .filter(([key, value]) => !TX_DETAILS_RESERVED_FIELDS_SET.has(key as any) && value.type !== 'button' && value.visibility !== 'hidden')
                .map(([key, value]) => ({
                    key: key as TranslationKey,
                    value: isCustomDataObject(value) ? value.value : value,
                    type: isCustomDataObject(value) ? value.type : 'text',
                    config: isCustomDataObject(value) ? value.config : undefined,
                })) || {}),
        ];

        return (
            <StructuredList
                classNames={TX_DATA_LIST}
                items={itemsWithExtraFields}
                layout="5-7"
                align="start"
                renderLabel={label => <div className={TX_DATA_LABEL}>{label}</div>}
                renderValue={(val, key, type, config) => {
                    if (type === 'link' && config) {
                        return (
                            <Link classNames={[cx(config?.className)]} href={config.href} target={config.target || '_blank'}>
                                {val}
                            </Link>
                        );
                    }
                    if (type === 'icon' && config) {
                        const icon = { url: config?.src, alt: config.alt || val };
                        return (
                            <div className={cx('adyen-pe-transaction-data__list-icon-value', config?.className)}>
                                <Icon {...icon} />
                                <Typography variant={TypographyVariant.BODY}> {val} </Typography>
                            </div>
                        );
                    }
                    return (
                        <Typography className={cx(config?.className)} variant={TypographyVariant.BODY}>
                            {val}
                        </Typography>
                    );
                }}
            />
        );
    }, [dataCustomization?.details?.fields, extraFields, i18n, transaction, onCopyReferenceId]);
};

export default TransactionDataProperties;
