import cx from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { DATE_FORMAT_DISPUTE_DETAILS } from '../../../../../constants';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';
import { TranslationKey } from '../../../../../translations';
import { IDisputeDetail, IDisputeStatus } from '../../../../../types/api/models/disputes';
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
import { DISPUTE_REASON_CATEGORIES } from '../../../../utils/disputes/constants';
import { getDefenseDocumentContent, getDefenseReasonContent } from '../../utils';

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

const DISPUTE_STATUSES_WITH_ACCEPTED_DATE: IDisputeStatus[] = ['ACCEPTED', 'EXPIRED'];

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
        const { pspReference: disputeReference, reason: disputeReason, acceptedDate, createdAt, dueDate, status, type } = dispute.dispute;
        const { pspReference: paymentReference, merchantReference, balanceAccount } = dispute.payment;
        const { reason: defenseReason, defendedOn, suppliedDocuments } = dispute.defense || {};

        const isFraudNotification = type === 'NOTIFICATION_OF_FRAUD';
        const isExpiredDispute = status === 'EXPIRED' || (status === 'LOST' && !isFraudNotification && !defendedOn);
        const isActionableDispute = isDisputeActionNeeded(dispute.dispute) && dispute.dispute.defensibility !== 'NOT_ACTIONABLE';

        const SKIP_ITEM: StructuredListProps['items'][number] = null!;

        const listItems: StructuredListProps['items'] = [
            // dispute reason
            {
                key: disputeDataKeys.disputeReason,
                value: `${i18n.get(DISPUTE_REASON_CATEGORIES[disputeReason.category])} - ${disputeReason.title}`, // [NOTE]: Not translated at the moment (maybe in the future)
                id: 'disputeReason',
            },

            // reason code
            !isFraudNotification
                ? {
                      key: disputeDataKeys.reasonCode,
                      value: disputeReason.code,
                      id: 'reasonCode',
                  }
                : SKIP_ITEM,

            // created at
            {
                key: disputeDataKeys.openedOn,
                value: <time dateTime={createdAt}>{dateFormat(createdAt, DATE_FORMAT_DISPUTE_DETAILS)}</time>,
                id: 'openedOn',
            },

            // respond by
            dueDate && isActionableDispute
                ? {
                      key: disputeDataKeys.respondBy,
                      value: <time dateTime={dueDate}>{dateFormat(dueDate, DATE_FORMAT_DISPUTE_DETAILS)}</time>,
                      id: 'respondBy',
                  }
                : SKIP_ITEM,

            // dispute reference
            {
                key: disputeDataKeys.disputeReference,
                value: (
                    <CopyText
                        buttonLabelKey="disputes.copy.disputeReference"
                        type={'Default' as const}
                        textToCopy={disputeReference}
                        showCopyTextTooltip={false}
                    />
                ),
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
                value: (
                    <CopyText
                        buttonLabelKey="disputes.copy.paymentReference"
                        type={'Default' as const}
                        textToCopy={paymentReference}
                        showCopyTextTooltip={false}
                    />
                ),
                id: 'paymentPspReference',
            },

            // merchant reference
            merchantReference
                ? {
                      key: disputeDataKeys.merchantReference,
                      value: (
                          <CopyText
                              buttonLabelKey="disputes.copy.merchantReference"
                              type={'Default' as const}
                              textToCopy={merchantReference}
                              showCopyTextTooltip={false}
                          />
                      ),
                      id: 'paymentMerchantReference',
                  }
                : SKIP_ITEM,

            // defense reason
            defenseReason
                ? {
                      key: disputeDataKeys.defenseReason,
                      value: getDefenseReasonContent(i18n, defenseReason)?.title ?? defenseReason,
                      id: 'defenseReason',
                  }
                : SKIP_ITEM,

            // defended on
            defendedOn
                ? {
                      key: disputeDataKeys.defendedOn,
                      value: <time dateTime={defendedOn}>{dateFormat(defendedOn, DATE_FORMAT_DISPUTE_DETAILS)}</time>,
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
                                          <Tag label={getDefenseDocumentContent(i18n, document)?.title ?? document} />
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
                                              aria-label={i18n.get('disputes.downloadEvidence')}
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
            acceptedDate && DISPUTE_STATUSES_WITH_ACCEPTED_DATE.includes(status)
                ? {
                      key: disputeDataKeys.acceptedOn,
                      value: <time dateTime={acceptedDate}>{dateFormat(acceptedDate, DATE_FORMAT_DISPUTE_DETAILS)}</time>,
                      id: 'acceptedOn',
                  }
                : SKIP_ITEM,

            // expired on
            dueDate && isExpiredDispute
                ? {
                      key: disputeDataKeys.expiredOn,
                      value: <time dateTime={dueDate}>{dateFormat(dueDate, DATE_FORMAT_DISPUTE_DETAILS)}</time>,
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
