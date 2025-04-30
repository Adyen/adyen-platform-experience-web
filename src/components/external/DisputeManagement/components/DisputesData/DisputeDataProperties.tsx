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
import { DisputeDetailsCustomization } from '../../types';
import { DISPUTE_DATA_LABEL, DISPUTE_DATA_LIST, DISPUTE_DATA_LIST_EVIDENCE, DISPUTE_DETAILS_RESERVED_FIELDS_SET } from './constants';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { DISPUTE_CATEGORY_LABELS } from '../../../DisputesOverview/components/DisputesTable/DisputesTable';

type DisputeDataPropertiesProps = {
    dispute: IDisputeDetail;
    dataCustomization?: { details?: DisputeDetailsCustomization };
    extraFields?: Record<any, any>;
};

const disputeDataKeys = {
    defendedOn: 'disputes.defendedOn',
    defenseReason: 'disputes.defenseReason',
    disputeEvidence: 'disputes.evidence',
    disputeReason: 'disputes.disputeReason',
    disputeReference: 'disputes.disputeReference',
    merchantReference: 'disputes.merchantReference',
    paymentReference: 'disputes.paymentReference',
    reasonCode: 'disputes.reasonCode',
} satisfies Record<string, TranslationKey>;

const DisputeDataProperties = ({ dispute, dataCustomization }: DisputeDataPropertiesProps) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting(dispute.payment.balanceAccount?.timeZone);

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
        //  latestDefense, reasonCode, reasonGroup
        const { pspReference: paymentPspReference, merchantReference: paymentMerchantReference } = dispute.payment;
        const { reason: disputeReason, pspReference } = dispute.dispute;
        const { defendedOn, reason: defenseReason, suppliedDocuments } = dispute.defense || {};

        const SKIP_ITEM: StructuredListProps['items'][number] = null!;

        const listItems: StructuredListProps['items'] = [
            // balance account
            // balanceAccount?.description ? { key: 'accountKey' as const, value: balanceAccount.description, id: 'description' } : SKIP_ITEM,

            // dispute reason
            disputeReason
                ? { key: disputeDataKeys.disputeReason, value: i18n.get(DISPUTE_CATEGORY_LABELS[disputeReason.category]), id: 'disputeReason' }
                : SKIP_ITEM,

            // reason code
            // reasonCode ? { key: disputeDataKeys.reasonCode, value: reasonCode, id: 'reasonCode' } : SKIP_ITEM,

            // dispute reference
            {
                key: disputeDataKeys.disputeReference,
                value: <CopyText type={'Default' as const} textToCopy={pspReference} showCopyTextTooltip={false} />,
                id: 'disputeId',
            },

            //psp reference
            paymentPspReference
                ? {
                      key: disputeDataKeys.paymentReference,
                      value: <CopyText type={'Default' as const} textToCopy={paymentPspReference} showCopyTextTooltip={false} />,
                      id: 'paymentPspReference',
                  }
                : SKIP_ITEM,

            // merchant reference
            paymentMerchantReference
                ? {
                      key: disputeDataKeys.merchantReference,
                      value: <CopyText type={'Default' as const} textToCopy={paymentMerchantReference} showCopyTextTooltip={false} />,
                      id: 'paymentMerchantReference',
                  }
                : SKIP_ITEM,

            // defense reason
            defenseReason ? { key: disputeDataKeys.defenseReason, value: defenseReason, id: 'defenseReason' } : SKIP_ITEM,

            //TODO: Clarify if it will be possible to get balance account from backend
            defendedOn
                ? {
                      key: disputeDataKeys.defendedOn,
                      value: dateFormat(defendedOn, DATE_FORMAT_DISPUTES_TAG),
                      id: 'defendedOn',
                  }
                : SKIP_ITEM,

            //TODO: Change this when download endpoint is ready
            suppliedDocuments
                ? {
                      key: disputeDataKeys.disputeEvidence,
                      value: (
                          <>
                              {suppliedDocuments.map((document, index) => {
                                  const queryParam = {
                                      path: { disputePspReference: pspReference },
                                      query: { documentType: document },
                                  };
                                  return (
                                      <div key={`${document}-${index}`} className={DISPUTE_DATA_LIST_EVIDENCE}>
                                          <Tag label={document} />
                                          <DownloadButton
                                              className={'adyen-pe-dispute-document-download'}
                                              endpointName={'downloadDefenseDocument'}
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
    }, [dispute, i18n, dateFormat, extraFields, dataCustomization?.details?.fields]);
};

export default DisputeDataProperties;
