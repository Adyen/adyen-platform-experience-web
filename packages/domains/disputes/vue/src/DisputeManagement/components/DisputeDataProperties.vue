<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import {
    BentoAlert,
    BentoButton,
    BentoLink,
    BentoStructuredList,
    BentoStructuredListItem,
    BentoTag,
    BentoTooltipDirective as vBentoTooltip,
    BentoTypography,
} from '@adyen/bento-vue3';
import DownloadIcon from '@adyen/ui-assets-icons-16/vue/download';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import { useLiveAnnouncement } from '@integration-components/composables-vue';
import {
    DISPUTE_DETAILS_FIELDS_REMAPS,
    DISPUTE_DETAILS_RESERVED_FIELDS_SET,
    getDefenseDocumentContent,
    getDefenseReasonContent,
    getDisputeReason,
    isDisputeActionNeeded,
    type DisputeDetailsCustomization,
    type TranslationConfigItem,
    type DisputesTranslationKey,
} from '@integration-components/disputes/domain';
import { DATE_FORMAT_DISPUTE_DETAILS, normalizeCustomFields } from '@integration-components/utils';
import type { IDisputeDetail, IDisputeStatus } from '@integration-components/types/api/models/disputes';
import { useDisputeFlow } from '../composables/useDisputeFlow';
import accessibilityStyles from '@integration-components/style/accessibility.module.scss';
import styles from './DisputeData.module.scss';
import { useDisputesContext } from '../../integration/context';

type CustomDataValue = {
    type?: string;
    value?: unknown;
    visibility?: string;
    config?: {
        className?: string;
        href?: string;
        target?: string;
        src?: string;
        alt?: string;
    };
};

type DetailItem =
    | { id: string; label: DisputesTranslationKey; kind: 'text'; value: string | undefined }
    | { id: string; label: DisputesTranslationKey; kind: 'date'; value: string }
    | { id: string; label: DisputesTranslationKey; kind: 'evidence'; value: string[] };

const DISPUTE_STATUSES_WITH_ACCEPTED_DATE: IDisputeStatus[] = ['ACCEPTED', 'EXPIRED'];

const props = defineProps<{
    dispute: IDisputeDetail;
    dataCustomization?: { details?: DisputeDetailsCustomization };
    defenseReasonConfig: Record<string, TranslationConfigItem>;
    extraFields?: Record<string, unknown>;
}>();

const { i18n, runtime } = useDisputesContext();
const { defenseDocumentConfig } = useDisputeFlow();
const { announce, announcement } = useLiveAnnouncement();
const downloadErrors = ref<Set<string>>(new Set());
const copiedItemId = ref<string>();

const hiddenFields = computed(
    () =>
        new Set(
            normalizeCustomFields(props.dataCustomization?.details?.fields, DISPUTE_DETAILS_FIELDS_REMAPS)
                ?.filter(field => field.visibility === 'hidden')
                .map(field => String(field.key))
        )
);

function isVisible(id: string) {
    return !hiddenFields.value.has(id);
}

function isCustomDataObject(value: unknown): value is CustomDataValue {
    return !!value && typeof value === 'object' && 'value' in value;
}

function formatDate(date: string) {
    return i18n.date(date, {
        timeZone: props.dispute.payment.balanceAccount?.timeZone || i18n.timezone,
        ...DATE_FORMAT_DISPUTE_DETAILS,
    });
}

const items = computed<DetailItem[]>(() => {
    const { pspReference: disputeReference, reason: disputeReason, acceptedDate, createdAt, dueDate, status, type } = props.dispute.dispute;
    const { pspReference: paymentReference, merchantReference, balanceAccount } = props.dispute.payment;
    const { reason: defenseReason, defendedOn, suppliedDocuments } = props.dispute.defense || {};
    const isFraudNotification = type === 'NOTIFICATION_OF_FRAUD';
    const isExpiredDispute = status === 'EXPIRED' || (status === 'LOST' && !isFraudNotification && !defendedOn);
    const isActionableDispute = isDisputeActionNeeded(props.dispute.dispute) && props.dispute.dispute.defensibility !== 'NOT_ACTIONABLE';

    return [
        {
            id: 'disputeReason',
            label: 'disputes.management.details.fields.disputeReason',
            kind: 'text',
            value: `${getDisputeReason(i18n, disputeReason.category)} - ${disputeReason.title}`,
        },
        !isFraudNotification
            ? {
                  id: 'reasonCode',
                  label: 'disputes.management.details.fields.reasonCode',
                  kind: 'text',
                  value: disputeReason.code,
              }
            : undefined,
        {
            id: 'openedOn',
            label: 'disputes.management.details.fields.openedOn',
            kind: 'date',
            value: createdAt,
        },
        dueDate && isActionableDispute
            ? {
                  id: 'respondBy',
                  label: 'disputes.management.details.fields.respondBy',
                  kind: 'date',
                  value: dueDate,
              }
            : undefined,
        {
            id: 'disputeId',
            label: 'disputes.management.details.fields.disputeReference',
            kind: 'text',
            value: disputeReference,
        },
        {
            id: 'account',
            label: 'disputes.management.details.fields.account',
            kind: 'text',
            value: balanceAccount?.description,
        },
        {
            id: 'paymentPspReference',
            label: 'disputes.management.details.fields.paymentReference',
            kind: 'text',
            value: paymentReference,
        },
        merchantReference
            ? {
                  id: 'paymentMerchantReference',
                  label: 'disputes.management.details.fields.merchantReference',
                  kind: 'text',
                  value: merchantReference,
              }
            : undefined,
        defenseReason
            ? {
                  id: 'defenseReason',
                  label: 'disputes.management.details.fields.defenseReason',
                  kind: 'text',
                  value: getDefenseReasonContent(props.defenseReasonConfig, i18n, defenseReason)?.title ?? defenseReason,
              }
            : undefined,
        defendedOn
            ? {
                  id: 'defendedOn',
                  label: 'disputes.management.details.fields.defendedOn',
                  kind: 'date',
                  value: defendedOn,
              }
            : undefined,
        suppliedDocuments?.length
            ? {
                  id: 'disputeEvidence',
                  label: 'disputes.management.details.fields.evidence',
                  kind: 'evidence',
                  value: suppliedDocuments,
              }
            : undefined,
        acceptedDate && DISPUTE_STATUSES_WITH_ACCEPTED_DATE.includes(status)
            ? {
                  id: 'acceptedOn',
                  label: 'disputes.management.details.fields.acceptedOn',
                  kind: 'date',
                  value: acceptedDate,
              }
            : undefined,
        dueDate && isExpiredDispute
            ? {
                  id: 'expiredOn',
                  label: 'disputes.management.details.fields.expiredOn',
                  kind: 'date',
                  value: dueDate,
              }
            : undefined,
    ].filter((item): item is DetailItem => !!item && isVisible(item.id));
});

const extraDetails = computed(() =>
    Object.entries(props.extraFields ?? {})
        .filter(([key, value]) => !DISPUTE_DETAILS_RESERVED_FIELDS_SET.has(key as never) && !isHiddenCustomValue(value) && !isCustomButton(value))
        .map(([key, value]) => ({
            key,
            value: isCustomDataObject(value) ? value.value : value,
            type: isCustomDataObject(value) ? value.type : 'text',
            config: isCustomDataObject(value) ? value.config : undefined,
        }))
);

function isCustomButton(value: unknown) {
    return isCustomDataObject(value) && value.type === 'button';
}

function isHiddenCustomValue(value: unknown) {
    return isCustomDataObject(value) && value.visibility === 'hidden';
}

function getCopyValue(item: DetailItem) {
    return ['disputeId', 'paymentPspReference', 'paymentMerchantReference'].includes(item.id) && item.kind === 'text' ? item.value : undefined;
}

function onCopyText(text: string, itemId: string) {
    navigator.clipboard?.writeText(text);
    copiedItemId.value = itemId;
    announce(() => i18n.get('disputes.actions.copy.labels.done'));
}

function getCopyTooltip(itemId: string) {
    const key = copiedItemId.value === itemId ? 'disputes.actions.copy.labels.done' : 'disputes.actions.copy.labels.default';
    return i18n.get(key);
}

function resetCopiedItem() {
    copiedItemId.value = undefined;
}

async function downloadEvidence(documentType: string) {
    const controller = new AbortController();
    downloadControllers.add(controller);

    try {
        const response = await runtime.downloadDefenseDocument({
            disputePspReference: props.dispute.dispute.pspReference,
            documentType,
            signal: controller.signal,
        });
        const url = URL.createObjectURL(response.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = response.filename || documentType;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
        if (downloadErrors.value.has(documentType)) {
            const nextErrors = new Set(downloadErrors.value);
            nextErrors.delete(documentType);
            downloadErrors.value = nextErrors;
        }
    } catch {
        if (!controller.signal.aborted) downloadErrors.value = new Set([...downloadErrors.value, documentType]);
    } finally {
        downloadControllers.delete(controller);
    }
}

const downloadControllers = new Set<AbortController>();
onUnmounted(() => downloadControllers.forEach(controller => controller.abort()));
</script>

<template>
    <BentoStructuredList :class="styles.list">
        <BentoStructuredListItem v-for="item in items" :key="item.id" :label="i18n.get(item.label)">
            <div v-if="getCopyValue(item)" :class="styles.copyableValue">
                <BentoTypography variant="body">
                    {{ getCopyValue(item) }}
                </BentoTypography>
                <BentoButton
                    v-bento-tooltip="getCopyTooltip(item.id)"
                    variant="tertiary"
                    :aria-label="i18n.get('disputes.actions.copy.labels.default')"
                    @click="onCopyText(getCopyValue(item)!, item.id)"
                    @blur="resetCopiedItem"
                    @mouseleave="resetCopiedItem"
                >
                    <CopyIcon />
                </BentoButton>
            </div>
            <time v-else-if="item.kind === 'date'" :datetime="item.value">
                <BentoTypography variant="body">{{ formatDate(item.value) }}</BentoTypography>
            </time>
            <div v-else-if="item.kind === 'evidence'" :class="styles.listEvidence">
                <template v-for="documentType in item.value" :key="documentType">
                    <BentoTag :label="getDefenseDocumentContent(defenseDocumentConfig, i18n, documentType)?.title ?? documentType" />
                    <BentoButton
                        variant="tertiary"
                        :aria-label="i18n.get('disputes.management.details.actions.downloadEvidence')"
                        @click="downloadEvidence(documentType)"
                    >
                        <DownloadIcon aria-hidden="true" />
                    </BentoButton>
                    <BentoAlert v-if="downloadErrors.has(documentType)" :class="styles.listEvidenceErrorMessage" type="critical" variant="tip">
                        <template #description>
                            {{ i18n.get('disputes.management.details.errors.downloadFailure') }}
                        </template>
                    </BentoAlert>
                </template>
            </div>
            <BentoTypography v-else variant="body">
                {{ item.value }}
            </BentoTypography>
        </BentoStructuredListItem>

        <BentoStructuredListItem v-for="item in extraDetails" :key="item.key" :label="i18n.get(item.key)">
            <BentoLink
                v-if="item.type === 'link' && item.config?.href"
                :class="item.config.className"
                :to="item.config.href"
                :target="item.config.target || '_blank'"
                rel="noopener noreferrer"
                external
            >
                {{ item.value }}
            </BentoLink>
            <div v-else-if="item.type === 'icon' && item.config?.src" :class="item.config.className">
                <img :src="item.config.src" :alt="item.config.alt || String(item.value ?? '')" />
                <BentoTypography variant="body">
                    {{ item.value }}
                </BentoTypography>
            </div>
            <BentoTypography v-else variant="body" :class="item.config?.className">
                {{ item.value }}
            </BentoTypography>
        </BentoStructuredListItem>
    </BentoStructuredList>
    <span :class="accessibilityStyles.visuallyHidden" aria-atomic="true" aria-live="polite">{{ announcement }}</span>
</template>
