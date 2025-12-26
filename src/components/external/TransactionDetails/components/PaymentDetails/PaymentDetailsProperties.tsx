import { memo } from 'preact/compat';
import { IAmount } from '../../../../../types';
import { isNullish } from '../../../../../utils';
import { useCallback, useMemo } from 'preact/hooks';
import { TranslationKey } from '../../../../../translations';
import { TransactionDetails, TransactionDetailsProps } from '../../types';
import { StructuredListProps } from '../../../../internal/StructuredList/types';
import { getTransactionRefundReason } from '../../../../utils/translation/getters';
import { isCustomDataObject } from '../../../../internal/DataGrid/components/TableCells';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { TX_DATA_LABEL, TX_DATA_LIST, sharedTransactionDetailsEventProperties } from '../../constants';
import useAnalyticsContext from '../../../../../core/Context/analytics/useAnalyticsContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import StructuredList from '../../../../internal/StructuredList';
import Typography from '../../../../internal/Typography/Typography';
import Icon from '../../../../internal/DataGrid/components/Icon';
import CopyText from '../../../../internal/CopyText/CopyText';
import Link from '../../../../internal/Link/Link';
import cx from 'classnames';

const copyButtonAnalyticsEventProperties = {
    ...sharedTransactionDetailsEventProperties,
    label: 'Copy button',
} as const;

const paymentDataKeys = {
    account: 'transactions.details.fields.account',
    fee: 'transactions.details.fields.fee',
    id: 'transactions.details.fields.referenceID',
    originalAmount: 'transactions.details.fields.originalAmount',
    originalPayment: 'transactions.details.fields.originalPayment',
    paymentPspReference: 'transactions.details.fields.paymentPspReference',
    pspReference: 'transactions.details.fields.pspReference',
    refundFee: 'transactions.details.fields.refundFee',
    refundPspReference: 'transactions.details.fields.refundPspReference',
    refundReason: 'transactions.details.fields.refundReason',
} satisfies Record<string, TranslationKey>;

const paymentDataCopyButtonKeys = {
    id: 'transactions.details.actions.copyReferenceID',
} satisfies Record<string, TranslationKey>;

const SKIP_ITEM: StructuredListProps['items'][number] = null!;

export interface PaymentDetailsPropertiesProps {
    dataCustomization?: TransactionDetailsProps['dataCustomization'];
    extraFields: Record<string, any> | undefined;
    transaction: TransactionDetails;
}

const PaymentDetailsProperties = ({ dataCustomization, extraFields, transaction }: PaymentDetailsPropertiesProps) => {
    const { i18n } = useCoreContext();

    const standardPropertiesList = useMemo<StructuredListProps['items']>(() => {
        const { balanceAccount, category, id, paymentPspReference, refundMetadata } = transaction;
        const customizedFields = dataCustomization?.details?.fields;
        const isRefundTransaction = category === 'Refund';

        const getFormattedAmount = (amount?: IAmount) => {
            if (isNullish(amount)) return null;
            const { value, currency } = amount;
            return i18n.amount(value, currency);
        };

        const deductedAmount = getFormattedAmount({
            currency: transaction.netAmount.currency,
            value: transaction.amountBeforeDeductions.value - transaction.netAmount.value,
        });

        const originalAmount = getFormattedAmount({
            currency: transaction.amountBeforeDeductions.currency,
            value: transaction.originalAmount?.value ?? transaction.amountBeforeDeductions.value,
        });

        const deductedAmountKey: TranslationKey = paymentDataKeys[isRefundTransaction ? 'refundFee' : 'fee'];
        const originalAmountKey: TranslationKey = paymentDataKeys[isRefundTransaction ? 'originalPayment' : 'originalAmount'];
        const paymentReferenceKey = paymentDataKeys[isRefundTransaction ? 'paymentPspReference' : 'pspReference'];

        const listItems: StructuredListProps['items'] = [
            // amounts
            originalAmount ? { key: originalAmountKey, value: originalAmount, id: 'originalAmount' } : SKIP_ITEM,
            deductedAmount ? { key: deductedAmountKey, value: deductedAmount, id: 'deductedAmount' } : SKIP_ITEM,

            // balance account
            balanceAccount?.description ? { id: 'description', key: paymentDataKeys.account, value: balanceAccount.description } : SKIP_ITEM,

            // refund reason
            isRefundTransaction && refundMetadata?.refundReason
                ? {
                      id: 'refundReason',
                      key: paymentDataKeys.refundReason,
                      value: getTransactionRefundReason(i18n, refundMetadata.refundReason),
                  }
                : SKIP_ITEM,

            // reference id
            {
                id: 'id',
                key: paymentDataKeys.id,
                value: (
                    <PaymentDetailsProperties.CopyText
                        copyButtonAriaLabelKey={paymentDataCopyButtonKeys.id}
                        trackingValue="referenceID"
                        textToCopy={id}
                    />
                ),
            },

            isRefundTransaction && refundMetadata?.refundPspReference
                ? {
                      id: 'refundPspReference',
                      key: paymentDataKeys.refundPspReference,
                      value: refundMetadata.refundPspReference,
                  }
                : SKIP_ITEM,

            // payment psp reference
            paymentPspReference
                ? {
                      id: 'paymentPspReference',
                      key: paymentReferenceKey,
                      value: paymentPspReference,
                  }
                : SKIP_ITEM,
        ] as const;

        const isVisibleField = customizedFields
            ? (id: string) => customizedFields.find(field => field.key === id)?.visibility !== 'hidden'
            : () => true;

        return listItems.filter(item => item?.id && isVisibleField(item.id));
    }, [i18n, dataCustomization, transaction]);

    const customPropertiesList = useMemo<StructuredListProps['items']>(
        () =>
            Object.entries(extraFields || {})
                .filter(([, value]) => value?.type !== 'button')
                .map(([key, value]) => ({
                    key: key as TranslationKey,
                    value: isCustomDataObject(value) ? value.value : value,
                    type: isCustomDataObject(value) ? value.type : 'text',
                    config: isCustomDataObject(value) ? value.config : undefined,
                })),
        [extraFields]
    );

    const listItems = useMemo(() => [...standardPropertiesList, ...customPropertiesList], [customPropertiesList, standardPropertiesList]);

    const renderListPropertyLabel = useCallback<NonNullable<StructuredListProps['renderLabel']>>(
        label => <div className={TX_DATA_LABEL}>{label}</div>,
        []
    );

    const renderListPropertyValue = useCallback<NonNullable<StructuredListProps['renderValue']>>((val, key, type, config) => {
        if (config) {
            switch (type) {
                case 'icon':
                    return (
                        <div className={cx(config.className, 'adyen-pe-transaction-data__list-icon-value')}>
                            <Icon url={config.src} alt={config.alt || val} />
                            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                                {' '}
                                {val}
                            </Typography>
                        </div>
                    );
                case 'link':
                    return (
                        <Link classNames={[cx(config.className)]} href={config.href} target={config.target || '_blank'}>
                            {val}
                        </Link>
                    );
            }
        }
        return (
            <Typography el={TypographyElement.DIV} variant={TypographyVariant.BODY} className={cx(config?.className)}>
                {val}
            </Typography>
        );
    }, []);

    return (
        <StructuredList
            align="start"
            layout="5-7"
            items={listItems}
            classNames={TX_DATA_LIST}
            renderLabel={renderListPropertyLabel}
            renderValue={renderListPropertyValue}
        />
    );
};

interface PaymentDetailsPropertiesCopyTextProps {
    copyButtonAriaLabelKey: TranslationKey;
    textToCopy: string;
    trackingValue?: string;
}

PaymentDetailsProperties.CopyText = memo(({ trackingValue, ...copyTextProps }: PaymentDetailsPropertiesCopyTextProps) => {
    const userEvents = useAnalyticsContext();

    const onCopyText = useCallback(() => {
        if (trackingValue) {
            userEvents.addEvent?.('Clicked button', { ...copyButtonAnalyticsEventProperties, value: trackingValue });
        }
    }, [trackingValue, userEvents]);

    return <CopyText {...copyTextProps} onCopyText={onCopyText} showCopyTextTooltip={false} type="Default" />;
});

export default memo(PaymentDetailsProperties);
