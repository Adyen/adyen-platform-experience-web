import cx from 'classnames';
import { useMemo } from 'preact/hooks';
import { DATE_FORMAT_DISPUTES_TAG } from '../../../../../constants';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';
import { TranslationKey } from '../../../../../translations';
import { IDisputeDetail } from '../../../../../types/api/models/disputes';
import Button from '../../../../internal/Button';
import { ButtonVariant } from '../../../../internal/Button/types';
import CopyText from '../../../../internal/CopyText/CopyText';
import Icon from '../../../../internal/DataGrid/components/Icon';
import { isCustomDataObject } from '../../../../internal/DataGrid/components/TableCells';
import Link from '../../../../internal/Link/Link';
import StructuredList from '../../../../internal/StructuredList';
import { StructuredListProps } from '../../../../internal/StructuredList/types';
import Download from '../../../../internal/SVGIcons/Download';
import { Tag } from '../../../../internal/Tag/Tag';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { DisputeDataProps } from '../../types';
import { DISPUTE_DATA_LABEL, DISPUTE_DATA_LIST, DISPUTE_DETAILS_RESERVED_FIELDS_SET } from './constants';

type DisputeDataPropertiesProps = {
    dispute: IDisputeDetail;
    dataCustomization?: DisputeDataProps['dataCustomization'];
    extraFields?: Record<any, any>;
};

const DisputeDataProperties = ({ dispute, dataCustomization, extraFields }: DisputeDataPropertiesProps) => {
    const { dateFormat } = useTimezoneAwareDateFormatting(dispute?.balanceAccount?.timeZone);

    return useMemo(() => {
        const { paymentPspReference, latestDefense, reasonCode, paymentMerchantReference, reasonGroup } = dispute;
        const SKIP_ITEM: StructuredListProps['items'][number] = null!;

        const listItems: StructuredListProps['items'] = [
            // balance account
            // balanceAccount?.description ? { key: 'accountKey' as const, value: balanceAccount.description, id: 'description' } : SKIP_ITEM,

            // disputeReason
            reasonGroup ? { key: 'dispute.disputeReason' as TranslationKey, value: reasonGroup, id: 'reasonGroup' } : SKIP_ITEM,

            // reasonCode
            reasonCode ? { key: 'dispute.reasonCode' as TranslationKey, value: reasonCode, id: 'reasonCode' } : SKIP_ITEM,

            // disputeReference
            {
                key: 'dispute.disputeReference' as TranslationKey,
                value: <CopyText type={'Default'} textToCopy={dispute.id} showCopyTextTooltip={false} />,
                id: 'id',
            },

            // psp reference
            paymentPspReference
                ? {
                      key: 'dispute.paymentReference' as TranslationKey,
                      value: <CopyText type={'Default'} textToCopy={paymentPspReference} showCopyTextTooltip={false} />,
                      id: 'paymentPspReference',
                  }
                : SKIP_ITEM,

            // merchant reference
            paymentMerchantReference
                ? { key: 'dispute.merchantReference' as TranslationKey, value: paymentMerchantReference, id: 'paymentMerchantReference' }
                : SKIP_ITEM,

            //defense reason
            latestDefense?.reason
                ? { key: 'dispute.merchantReference' as TranslationKey, value: latestDefense.reason, id: 'defenseReason' }
                : SKIP_ITEM,

            //TODO: Clarify if it will be possible to get balance account from backend
            latestDefense?.defendedOn
                ? {
                      key: 'dispute.defendedOn' as TranslationKey,
                      value: dateFormat(latestDefense.defendedOn, DATE_FORMAT_DISPUTES_TAG),
                      id: 'defenseReason',
                  }
                : SKIP_ITEM,

            //TODO: Change this when download endpoint is ready
            latestDefense?.suppliedDocuments
                ? {
                      key: 'dispute.evidence' as TranslationKey,
                      value: (
                          <>
                              {latestDefense.suppliedDocuments.map(document => (
                                  <Button variant={ButtonVariant.TERTIARY} key={`button-${document}`} onClick={() => {}}>
                                      <Tag>{document}</Tag>
                                      <Download />
                                  </Button>
                              ))}
                          </>
                      ),
                      id: 'defenseReason',
                  }
                : SKIP_ITEM,
        ]
            .filter(Boolean)
            .filter(val => !dataCustomization?.details?.fields?.some(field => field.key === val.id && field.visibility === 'hidden'));

        // Add custom data
        const itemsWithExtraFields = [
            ...listItems,
            ...(Object.entries(extraFields || {})
                .filter(
                    ([key, value]) => !DISPUTE_DETAILS_RESERVED_FIELDS_SET.has(key as any) && value.type !== 'button' && value.visibility !== 'hidden'
                )
                .map(([key, value]) => ({
                    key: key as TranslationKey,
                    value: isCustomDataObject(value) ? value.value : value,
                    type: isCustomDataObject(value) ? value.type : 'text',
                    config: isCustomDataObject(value) ? value.config : undefined,
                })) || {}),
        ];

        return (
            <StructuredList
                classNames={DISPUTE_DATA_LIST}
                items={itemsWithExtraFields}
                layout="5-7"
                align="start"
                renderLabel={label => <div className={DISPUTE_DATA_LABEL}>{label}</div>}
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
                            <div className={cx('adyen-pe-dispute-data__list-icon-value', config?.className)}>
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
    }, [dispute, dateFormat, dataCustomization?.details?.fields, extraFields]);
};

export default DisputeDataProperties;
