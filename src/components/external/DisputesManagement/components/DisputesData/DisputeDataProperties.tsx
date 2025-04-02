import cx from 'classnames';
import { useMemo } from 'preact/hooks';
import { TranslationKey } from '../../../../../translations';
import { IDisputeDetail } from '../../../../../types/api/models/disputes';
import CopyText from '../../../../internal/CopyText/CopyText';
import Icon from '../../../../internal/DataGrid/components/Icon';
import { isCustomDataObject } from '../../../../internal/DataGrid/components/TableCells';
import Link from '../../../../internal/Link/Link';
import StructuredList from '../../../../internal/StructuredList';
import { StructuredListProps } from '../../../../internal/StructuredList/types';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import type { TransactionDataProps } from '../../../TransactionDetails';
import { TX_DATA_LABEL, TX_DATA_LIST, TX_DETAILS_RESERVED_FIELDS_SET } from '../../../TransactionDetails/components/constants';

type DisputeDataPropertiesProps = {
    dispute: IDisputeDetail;
    dataCustomization?: TransactionDataProps['dataCustomization'];
    extraFields?: Record<any, any>;
};

const DisputeDataProperties = ({ dispute, dataCustomization, extraFields }: DisputeDataPropertiesProps) => {
    return useMemo(() => {
        const { paymentPspReference, latestDefense, reasonCode, paymentMerchantReference, reasonGroup } = dispute;
        const SKIP_ITEM: StructuredListProps['items'][number] = null!;

        const disputeReasonKey = 'dispute.disputeReason';
        const reasonCodeKey = 'dispute.reasonCode';
        // const accountKey = 'dispute.account';
        const disputeReferenceKey = 'dispute.disputeReference';
        const paymentReferenceKey = 'dispute.paymentReference';
        const merchantReferenceKey = 'dispute.merchantReference';
        const defenseReasonKey = 'dispute.merchantReference';
        const defendedOnKey = 'dispute.defendedOn';
        const evidenceKey = 'dispute.evidence';

        const listItems: StructuredListProps['items'] = [
            // balance account
            // balanceAccount?.description ? { key: 'accountKey' as const, value: balanceAccount.description, id: 'description' } : SKIP_ITEM,

            // disputeReason
            disputeReasonKey ? { key: disputeReasonKey as TranslationKey, value: reasonGroup, id: 'reasonGroup' } : SKIP_ITEM,

            // reasonCode
            reasonCode ? { key: reasonCodeKey as TranslationKey, value: reasonCode, id: 'reasonCode' } : SKIP_ITEM,

            // disputeReference
            {
                key: disputeReferenceKey as TranslationKey,
                value: <CopyText type={'Default'} textToCopy={dispute.id} showCopyTextTooltip={false} />,
                id: 'id',
            },

            // psp reference
            paymentPspReference
                ? {
                      key: paymentReferenceKey as TranslationKey,
                      value: <CopyText type={'Default'} textToCopy={paymentPspReference} showCopyTextTooltip={false} />,
                      id: 'paymentPspReference',
                  }
                : SKIP_ITEM,

            // merchant reference
            paymentMerchantReference
                ? { key: merchantReferenceKey as TranslationKey, value: paymentMerchantReference, id: 'paymentMerchantReference' }
                : SKIP_ITEM,

            //defense reason
            latestDefense?.reason ? { key: defenseReasonKey as TranslationKey, value: latestDefense.reason, id: 'defenseReason' } : SKIP_ITEM,

            //defended on
            latestDefense?.defendedOn ? { key: defendedOnKey as TranslationKey, value: latestDefense.defendedOn, id: 'defenseReason' } : SKIP_ITEM,

            //evidence
            latestDefense?.suppliedDocuments
                ? { key: evidenceKey as TranslationKey, value: latestDefense.suppliedDocuments, id: 'defenseReason' }
                : SKIP_ITEM,
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
    }, [dispute, dataCustomization?.details?.fields, extraFields]);
};

export default DisputeDataProperties;
