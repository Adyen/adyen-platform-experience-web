import cx from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { DATE_FORMAT_DISPUTE_DETAILS } from '../../../../../constants';
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
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { CustomColumn } from '../../../../types';
import { PAYOUT_TABLE_FIELDS } from '../../../PayoutsOverview/components/PayoutsTable/PayoutsTable';
import { DisputeDetailsCustomization } from '../../types';
import { isDisputeActionNeeded } from '../../../../utils/disputes/actionNeeded';
import {
    DISPUTE_DATA_LABEL,
    DISPUTE_DATA_LIST,
    DISPUTE_DATA_LIST_EVIDENCE,
    DISPUTE_DETAILS_RESERVED_FIELDS_SET,
    DISPUTE_DATA_LIST_EVIDENCE_ERROR_MESSAGE,
} from './constants';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import SVGIcon from '../../../../internal/Icon';

type DisputeDataPropertiesProps = {
    dispute: IDisputeDetail;
    dataCustomization?: { details?: DisputeDetailsCustomization };
    extraFields?: Record<any, any>;
};

const disputeDataKeys = {
    acceptedOn: 'disputes.acceptedOn',
    account: 'disputes.account',
    defendedOn: 'disputes.defendedOn',
    defenseReason: 'disputes.defenseReason',
    disputeEvidence: 'disputes.evidence',
    disputeReason: 'disputes.disputeReason',
    disputeReference: 'disputes.disputeReference',
    expiredOn: 'disputes.expiredOn',
    merchantReference: 'disputes.merchantReference',
    openedOn: 'disputes.openedOn',
    paymentReference: 'disputes.paymentReference',
    reasonCode: 'disputes.reasonCode',
    respondBy: 'disputes.respondBy',
} satisfies Record<string, TranslationKey>;

const DisputeDataProperties = ({ dispute, dataCustomization }: DisputeDataPropertiesProps) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting(dispute.payment.balanceAccount.timeZone);

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
        const actionNeeded = isDisputeActionNeeded(dispute.dispute);

        const { pspReference: disputeReference, reason: disputeReason, acceptedDate, createdAt, dueDate, status, type } = dispute.dispute;
        const { pspReference: paymentReference, merchantReference, balanceAccount } = dispute.payment;
        const { reason: defenseReason, defendedOn, suppliedDocuments } = dispute.defense || {};

        const SKIP_ITEM: StructuredListProps['items'][number] = null!;

        const listItems: StructuredListProps['items'] = [
            // dispute reason
            {
                key: disputeDataKeys.disputeReason,
                value: disputeReason.title, // [NOTE]: Not translated at the moment (maybe in the future)
                id: 'disputeReason',
            },

            // reason code
            type !== 'NOTIFICATION_OF_FRAUD'
                ? {
                      key: disputeDataKeys.reasonCode,
                      value: disputeReason.code,
                      id: 'reasonCode',
                  }
                : SKIP_ITEM,

            // created at
            {
                key: disputeDataKeys.openedOn,
                value: dateFormat(createdAt, DATE_FORMAT_DISPUTE_DETAILS),
                id: 'openedOn',
            },

            // respond by
            dueDate && actionNeeded
                ? {
                      key: disputeDataKeys.respondBy,
                      value: dateFormat(dueDate, DATE_FORMAT_DISPUTE_DETAILS),
                      id: 'respondBy',
                  }
                : SKIP_ITEM,

            // dispute reference
            {
                key: disputeDataKeys.disputeReference,
                value: <CopyText type={'Default' as const} textToCopy={disputeReference} showCopyTextTooltip={false} />,
                id: 'disputeId',
            },

            // balance account
            {
                key: disputeDataKeys.account,
                value: balanceAccount.description,
                id: 'account',
            },

            // psp reference
            {
                key: disputeDataKeys.paymentReference,
                value: <CopyText type={'Default' as const} textToCopy={paymentReference} showCopyTextTooltip={false} />,
                id: 'paymentPspReference',
            },

            // merchant reference
            merchantReference
                ? {
                      key: disputeDataKeys.merchantReference,
                      value: <CopyText type={'Default' as const} textToCopy={merchantReference} showCopyTextTooltip={false} />,
                      id: 'paymentMerchantReference',
                  }
                : SKIP_ITEM,

            // defense reason
            defenseReason
                ? {
                      key: disputeDataKeys.defenseReason,
                      value: defenseReason, // [TODO]: The defense reason should be translated (??)
                      id: 'defenseReason',
                  }
                : SKIP_ITEM,

            // defended on
            defendedOn
                ? {
                      key: disputeDataKeys.defendedOn,
                      value: dateFormat(defendedOn, DATE_FORMAT_DISPUTE_DETAILS),
                      id: 'defendedOn',
                  }
                : SKIP_ITEM,

            // evidence
            suppliedDocuments && suppliedDocuments.length > 0
                ? {
                      key: disputeDataKeys.disputeEvidence,
                      value: (
                          <>
                              {suppliedDocuments.map((document, index) => {
                                  const queryParam = {
                                      path: { disputePspReference: disputeReference },
                                      query: { documentType: document },
                                  };
                                  return (
                                      <div key={`${document}-${index}`} className={DISPUTE_DATA_LIST_EVIDENCE}>
                                          {/* [NOTE]: Document label not translated at the moment (maybe in the future) */}
                                          <Tag label={document} />
                                          <DownloadButton
                                              className={'adyen-pe-dispute-document-download'}
                                              endpointName={'downloadDefenseDocument'}
                                              disabled={false}
                                              requestParams={queryParam}
                                              iconButton={true}
                                              errorMessage={() => {
                                                  return (
                                                      <div className={DISPUTE_DATA_LIST_EVIDENCE_ERROR_MESSAGE}>
                                                          <SVGIcon name="info-filled" />
                                                          <Typography variant={TypographyVariant.CAPTION} el={TypographyElement.SPAN}>
                                                              {i18n.get('disputes.error.failedRetry')}
                                                          </Typography>
                                                      </div>
                                                  );
                                              }}
                                              onDownloadRequested={() => console.warn('Download failed for', document)}
                                          />
                                      </div>
                                  );
                              })}
                          </>
                      ),
                      id: 'disputeEvidence',
                  }
                : SKIP_ITEM,

            // accepted on
            acceptedDate && status === 'ACCEPTED'
                ? {
                      key: disputeDataKeys.acceptedOn,
                      value: dateFormat(acceptedDate, DATE_FORMAT_DISPUTE_DETAILS),
                      id: 'acceptedOn',
                  }
                : SKIP_ITEM,

            // expired on
            dueDate && status === 'EXPIRED'
                ? {
                      key: disputeDataKeys.expiredOn,
                      value: dateFormat(dueDate, DATE_FORMAT_DISPUTE_DETAILS),
                      id: 'expiredOn',
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
                layout="4-8"
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
                                <Typography variant={TypographyVariant.BODY}>{val}</Typography>
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
