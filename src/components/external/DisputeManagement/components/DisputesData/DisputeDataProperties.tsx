import cx from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { DATE_FORMAT_DISPUTES_TAG } from '../../../../../constants';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';
import { TranslationKey } from '../../../../../translations';
import { IDisputeDetail } from '../../../../../types/api/models/disputes';
import DownloadButton from '../../../../internal/Button/DownloadButton/DownloadButton';
import CopyText from '../../../../internal/CopyText/CopyText';
import Icon from '../../../../internal/DataGrid/components/Icon';
import { isCustomDataObject } from '../../../../internal/DataGrid/components/TableCells';
import Link from '../../../../internal/Link/Link';
import StructuredList from '../../../../internal/StructuredList';
import { StructuredListProps } from '../../../../internal/StructuredList/types';
import { Tag } from '../../../../internal/Tag/Tag';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { CustomColumn } from '../../../../types';
import { PAYOUT_TABLE_FIELDS } from '../../../PayoutsOverview/components/PayoutsTable/PayoutsTable';
import { TX_DETAILS_RESERVED_FIELDS_SET } from '../../../TransactionDetails/components/constants';
import { DisputeDetailsCustomization } from '../../types';
import { DISPUTE_DATA_LABEL, DISPUTE_DATA_LIST, DISPUTE_DATA_LIST_EVIDENCE, DISPUTE_DETAILS_RESERVED_FIELDS_SET } from './constants';

type DisputeDataPropertiesProps = {
    dispute: IDisputeDetail;
    dataCustomization?: { details?: DisputeDetailsCustomization };
    extraFields?: Record<any, any>;
};

const disputeDataKeys = {
    defendedOn: 'dispute.defendedOn',
    defenseReason: 'dispute.defenseReason',
    disputeEvidence: 'dispute.evidence',
    disputeReason: 'dispute.disputeReason',
    disputeReference: 'dispute.disputeReference',
    merchantReference: 'dispute.merchantReference',
    paymentReference: 'dispute.paymentReference',
    reasonCode: 'dispute.reasonCode',
} satisfies Record<string, TranslationKey>;

const DisputeDataProperties = ({ dispute, dataCustomization }: DisputeDataPropertiesProps) => {
    const { dateFormat } = useTimezoneAwareDateFormatting(dispute?.balanceAccount?.timeZone);

    const [extraFields, setExtraFields] = useState<Record<string, any>>();

    const getExtraFields = useCallback(async () => {
        if (dispute) {
            const detailsData = await dataCustomization?.details?.onDataRetrieve?.(dispute);

            setExtraFields(
                dataCustomization?.details?.fields.reduce((acc, field) => {
                    return DISPUTE_DETAILS_RESERVED_FIELDS_SET.has(field.key as any) ||
                        PAYOUT_TABLE_FIELDS.includes(field.key as any) ||
                        field?.visibility === 'hidden'
                        ? acc
                        : { ...acc, ...(detailsData?.[field.key] ? { [field.key]: detailsData[field.key] } : {}) };
                }, {} as CustomColumn<any>)
            );
        }
    }, [dispute, dataCustomization]);

    useEffect(() => {
        void getExtraFields();
    }, [getExtraFields]);

    return useMemo(() => {
        const { paymentPspReference, latestDefense, reasonCode, paymentMerchantReference, reasonGroup } = dispute;
        const SKIP_ITEM: StructuredListProps['items'][number] = null!;

        const listItems: StructuredListProps['items'] = [
            // balance account
            // balanceAccount?.description ? { key: 'accountKey' as const, value: balanceAccount.description, id: 'description' } : SKIP_ITEM,

            // dispute reason
            reasonGroup ? { key: disputeDataKeys.disputeReason, value: reasonGroup, id: 'reasonGroup' } : SKIP_ITEM,

            // reason code
            reasonCode ? { key: disputeDataKeys.reasonCode, value: reasonCode, id: 'reasonCode' } : SKIP_ITEM,

            // dispute reference
            {
                key: disputeDataKeys.disputeReference,
                value: <CopyText type={'Default'} textToCopy={dispute.id} showCopyTextTooltip={false} />,
                id: 'disputeId',
            },

            //psp reference
            paymentPspReference
                ? {
                      key: disputeDataKeys.paymentReference,
                      value: <CopyText type={'Default'} textToCopy={paymentPspReference} showCopyTextTooltip={false} />,
                      id: 'paymentPspReference',
                  }
                : SKIP_ITEM,

            // merchant reference
            paymentMerchantReference
                ? {
                      key: disputeDataKeys.merchantReference,
                      value: <CopyText type={'Default'} textToCopy={paymentMerchantReference} showCopyTextTooltip={false} />,
                      id: 'paymentMerchantReference',
                  }
                : SKIP_ITEM,

            // defense reason
            latestDefense?.reason ? { key: disputeDataKeys.defenseReason, value: latestDefense.reason, id: 'defenseReason' } : SKIP_ITEM,

            //TODO: Clarify if it will be possible to get balance account from backend
            latestDefense?.defendedOn
                ? {
                      key: disputeDataKeys.defendedOn,
                      value: dateFormat(latestDefense.defendedOn, DATE_FORMAT_DISPUTES_TAG),
                      id: 'defendedOn',
                  }
                : SKIP_ITEM,

            //TODO: Change this when download endpoint is ready
            latestDefense?.suppliedDocuments
                ? {
                      key: disputeDataKeys.disputeEvidence,
                      value: (
                          <>
                              {latestDefense.suppliedDocuments.map((document, index) => {
                                  const queryParam = {
                                      path: { id: dispute.id },
                                      query: { documentType: document },
                                  };
                                  return (
                                      <div key={`${document}-${index}`} className={DISPUTE_DATA_LIST_EVIDENCE}>
                                          <Tag label={document} />
                                          <DownloadButton
                                              className={'adyen-pe-dispute-document-download'}
                                              endpointName={'downloadDisputeFile'}
                                              disabled={false}
                                              requestParams={queryParam}
                                              iconButton={true}
                                              onDownloadRequested={() => {}}
                                          />
                                      </div>
                                  );
                              })}
                          </>
                      ),
                      id: 'disputeEvidence',
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
