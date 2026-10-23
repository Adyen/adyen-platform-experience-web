import type Localization from '@integration-components/core/Localization';
import type { IDisputeDetail, IDisputeStatus } from '@integration-components/types/api/models/disputes';
import { isDisputeActionNeeded } from '../actionNeeded';
import type { DisputesTranslationKey } from '../shared/types';
import { getDisputeReason } from '../translations';
import { getDefenseReasonContent, type TranslationConfigItem } from './utils';

export type DisputeDetailItem =
    | { id: string; label: DisputesTranslationKey; kind: 'text'; value: string | undefined }
    | { id: string; label: DisputesTranslationKey; kind: 'date'; value: string }
    | { id: string; label: DisputesTranslationKey; kind: 'evidence'; value: string[] };

const DISPUTE_STATUSES_WITH_ACCEPTED_DATE: IDisputeStatus[] = ['ACCEPTED', 'EXPIRED'];

export const getDisputeDetailItems = (
    i18n: Localization['i18n'],
    { dispute, payment, defense }: IDisputeDetail,
    defenseReasonConfig: Record<string, TranslationConfigItem>
): DisputeDetailItem[] => {
    const { pspReference: disputeReference, reason: disputeReason, acceptedDate, createdAt, dueDate, status, type } = dispute;
    const { pspReference: paymentReference, merchantReference, balanceAccount } = payment;
    const { reason: defenseReason, defendedOn, suppliedDocuments } = defense || {};

    const isFraudNotification = type === 'NOTIFICATION_OF_FRAUD';
    const isExpiredDispute = status === 'EXPIRED' || (status === 'LOST' && !isFraudNotification && !defendedOn);
    const isActionableDispute = isDisputeActionNeeded(dispute) && dispute.defensibility !== 'NOT_ACTIONABLE';

    const rows: [hasValue: boolean, item: DisputeDetailItem][] = [
        [
            true,
            {
                id: 'disputeReason',
                label: 'disputes.management.details.fields.disputeReason',
                kind: 'text',
                value: `${getDisputeReason(i18n, disputeReason.category)} - ${disputeReason.title}`,
            },
        ],
        [!isFraudNotification, { id: 'reasonCode', label: 'disputes.management.details.fields.reasonCode', kind: 'text', value: disputeReason.code }],
        [true, { id: 'openedOn', label: 'disputes.management.details.fields.openedOn', kind: 'date', value: createdAt }],
        [
            !!dueDate && isActionableDispute,
            { id: 'respondBy', label: 'disputes.management.details.fields.respondBy', kind: 'date', value: dueDate as string },
        ],
        [true, { id: 'disputeId', label: 'disputes.management.details.fields.disputeReference', kind: 'text', value: disputeReference }],
        [true, { id: 'account', label: 'disputes.management.details.fields.account', kind: 'text', value: balanceAccount?.description }],
        [true, { id: 'paymentPspReference', label: 'disputes.management.details.fields.paymentReference', kind: 'text', value: paymentReference }],
        [
            !!merchantReference,
            { id: 'paymentMerchantReference', label: 'disputes.management.details.fields.merchantReference', kind: 'text', value: merchantReference },
        ],
        [
            !!defenseReason,
            {
                id: 'defenseReason',
                label: 'disputes.management.details.fields.defenseReason',
                kind: 'text',
                value: defenseReason ? (getDefenseReasonContent(defenseReasonConfig, i18n, defenseReason)?.title ?? defenseReason) : undefined,
            },
        ],
        [!!defendedOn, { id: 'defendedOn', label: 'disputes.management.details.fields.defendedOn', kind: 'date', value: defendedOn as string }],
        [
            !!suppliedDocuments?.length,
            { id: 'disputeEvidence', label: 'disputes.management.details.fields.evidence', kind: 'evidence', value: suppliedDocuments as string[] },
        ],
        [
            !!acceptedDate && DISPUTE_STATUSES_WITH_ACCEPTED_DATE.includes(status),
            { id: 'acceptedOn', label: 'disputes.management.details.fields.acceptedOn', kind: 'date', value: acceptedDate as string },
        ],
        [
            !!dueDate && isExpiredDispute,
            { id: 'expiredOn', label: 'disputes.management.details.fields.expiredOn', kind: 'date', value: dueDate as string },
        ],
    ];

    return rows.filter(([hasValue]) => hasValue).map(([, item]) => item);
};
