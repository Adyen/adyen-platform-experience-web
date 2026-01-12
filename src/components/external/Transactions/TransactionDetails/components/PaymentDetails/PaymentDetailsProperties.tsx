import { memo } from 'preact/compat';
import { useCallback, useMemo } from 'preact/hooks';
import { TranslationKey } from '../../../../../../translations';
import { TransactionDetails, TransactionDetailsProps } from '../../types';
import { StructuredListProps } from '../../../../../internal/StructuredList/types';
import { getTransactionRefundReason } from '../../../../../utils/translation/getters';
import { isCustomDataObject } from '../../../../../internal/DataGrid/components/TableCells';
import { TypographyElement, TypographyVariant } from '../../../../../internal/Typography/types';
import { TX_DATA_LABEL, TX_DATA_LIST, TX_DETAILS_FIELDS_REMAPS, sharedTransactionDetailsEventProperties } from '../../constants';
import normalizeCustomFields from '../../../../../utils/customData/normalizeCustomFields';
import useAnalyticsContext from '../../../../../../core/Context/analytics/useAnalyticsContext';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import StructuredList from '../../../../../internal/StructuredList';
import Typography from '../../../../../internal/Typography/Typography';
import Icon from '../../../../../internal/DataGrid/components/Icon';
import CopyText from '../../../../../internal/CopyText/CopyText';
import Link from '../../../../../internal/Link/Link';
import cx from 'classnames';

const copyButtonAnalyticsEventProperties = {
    ...sharedTransactionDetailsEventProperties,
    sectionName: 'Details',
    label: 'Copy button',
} as const;

const paymentDataKeys = {
    account: 'transactions.details.fields.account',
    id: 'transactions.details.fields.referenceID',
    merchantReference: 'transactions.details.fields.merchantReference',
    pspReference: 'transactions.details.fields.pspReference',
    refundPspReference: 'transactions.details.fields.refundPspReference',
    refundReason: 'transactions.details.fields.refundReason',
} satisfies Record<string, TranslationKey>;

const paymentDataCopyButtonKeys = {
    id: 'transactions.details.actions.copyReferenceID',
    merchantReference: 'transactions.details.actions.copyMerchantReference',
    pspReference: 'transactions.details.actions.copyPspReference',
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
        const { balanceAccount, category, id, merchantReference, paymentPspReference, refundMetadata } = transaction;
        const account = balanceAccount?.description || balanceAccount?.id;
        const isRefundTransaction = category === 'Refund';

        const customizedFields = normalizeCustomFields(dataCustomization?.details?.fields, TX_DETAILS_FIELDS_REMAPS, transaction);

        const listItems: StructuredListProps['items'] = [
            // balance account
            account ? { id: 'account', key: paymentDataKeys.account, value: account } : SKIP_ITEM,

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
                        trackingName="Reference ID"
                        textToCopy={id}
                    />
                ),
            },

            // merchant reference
            merchantReference
                ? {
                      id: 'merchantReference',
                      key: paymentDataKeys.merchantReference,
                      value: (
                          <PaymentDetailsProperties.CopyText
                              copyButtonAriaLabelKey={paymentDataCopyButtonKeys.merchantReference}
                              trackingName="Merchant reference"
                              textToCopy={merchantReference}
                          />
                      ),
                  }
                : SKIP_ITEM,

            // payment psp reference
            paymentPspReference
                ? {
                      id: 'paymentPspReference',
                      key: paymentDataKeys.pspReference,
                      value: (
                          <PaymentDetailsProperties.CopyText
                              copyButtonAriaLabelKey={paymentDataCopyButtonKeys.pspReference}
                              trackingName="PSP reference"
                              textToCopy={paymentPspReference}
                          />
                      ),
                  }
                : SKIP_ITEM,

            // refund psp reference
            isRefundTransaction && refundMetadata?.refundPspReference
                ? {
                      id: 'refundPspReference',
                      key: paymentDataKeys.refundPspReference,
                      value: refundMetadata.refundPspReference,
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
    trackingName?: string;
}

PaymentDetailsProperties.CopyText = memo(({ trackingName, ...copyTextProps }: PaymentDetailsPropertiesCopyTextProps) => {
    const userEvents = useAnalyticsContext();

    const onCopyText = useCallback(() => {
        if (trackingName) {
            userEvents.addEvent?.('Clicked button', {
                ...copyButtonAnalyticsEventProperties,
                subSectionName: trackingName,
            });
        }
    }, [trackingName, userEvents]);

    return <CopyText {...copyTextProps} onCopyText={onCopyText} showCopyTextTooltip={false} type="Default" />;
});

export default memo(PaymentDetailsProperties);
