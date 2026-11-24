<script setup lang="ts">
import { computed, ref } from 'vue';
import { BentoAlert, BentoButton, BentoStructuredList, BentoStructuredListItem, BentoTag, BentoTypography } from '@adyen/bento-vue3';
import DownloadIcon from '@adyen/ui-assets-icons-16/vue/download';
import { useConfigContext, useCoreContext } from '@integration-components/core/vue';
import { CopyText, CustomDetailValue } from '@integration-components/composables-vue';
import useTimezoneAwareDateFormatting from '@integration-components/composables-vue/useTimezoneAwareDateFormatting';
import {
    DISPUTE_DETAILS_FIELDS_REMAPS,
    DISPUTE_DETAILS_RESERVED_FIELDS_SET,
    getDefenseDocumentContent,
    getDisputeDetailItems,
    type DisputeDetailItem,
    type DisputeDetailsCustomization,
    type DisputesTranslationKey,
    type TranslationConfigItem,
} from '@integration-components/disputes/domain';
import { DATE_FORMAT_DISPUTE_DETAILS, isFunction, normalizeCustomFields } from '@integration-components/utils';
import type { IDisputeDetail } from '@integration-components/types/api/models/disputes';
import { useDisputeFlow } from '../composables/useDisputeFlow';
import styles from './DisputeData.module.scss';

type CustomDataValue = {
    type?: string;
    value?: unknown;
    visibility?: string;
};

// These three references sit next to each other, so a shared "Copy" name would
// leave the buttons indistinguishable to a screen reader.
const COPYABLE_FIELD_LABELS = {
    disputeId: 'disputes.management.details.copy.disputeReference',
    paymentPspReference: 'disputes.management.details.copy.paymentReference',
    paymentMerchantReference: 'disputes.management.details.copy.merchantReference',
} as const satisfies Record<string, DisputesTranslationKey>;

const props = defineProps<{
    dispute: IDisputeDetail;
    dataCustomization?: { details?: DisputeDetailsCustomization };
    defenseReasonConfig: Record<string, TranslationConfigItem>;
    extraFields?: Record<string, unknown>;
}>();

const { i18n } = useCoreContext();
const config = useConfigContext();
const { defenseDocumentConfig } = useDisputeFlow();
const { dateFormat } = useTimezoneAwareDateFormatting(() => props.dispute.payment.balanceAccount?.timeZone);
const downloadErrors = ref<Set<string>>(new Set());

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
    return dateFormat(date, DATE_FORMAT_DISPUTE_DETAILS);
}

const items = computed(() => getDisputeDetailItems(i18n, props.dispute, props.defenseReasonConfig).filter(item => isVisible(item.id)));

const extraDetails = computed(() =>
    Object.entries(props.extraFields ?? {})
        .filter(([key, value]) => !DISPUTE_DETAILS_RESERVED_FIELDS_SET.has(key as never) && !isHiddenCustomValue(value) && !isCustomButton(value))
        .map(([key, value]) => ({ key, value }))
);

function isCustomButton(value: unknown) {
    return isCustomDataObject(value) && value.type === 'button';
}

function isHiddenCustomValue(value: unknown) {
    return isCustomDataObject(value) && value.visibility === 'hidden';
}

function getCopyValue(item: DisputeDetailItem) {
    return item.id in COPYABLE_FIELD_LABELS && item.kind === 'text' ? item.value : undefined;
}

function getCopyAriaLabelKey(itemId: string) {
    return COPYABLE_FIELD_LABELS[itemId as keyof typeof COPYABLE_FIELD_LABELS];
}

async function downloadEvidence(documentType: string) {
    const downloadDefenseDocument = config.endpoints?.downloadDefenseDocument;
    if (!isFunction(downloadDefenseDocument)) return;

    try {
        const response = await downloadDefenseDocument(
            {},
            {
                path: { disputePspReference: props.dispute.dispute.pspReference },
                query: { documentType },
            }
        );
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
        downloadErrors.value = new Set([...downloadErrors.value, documentType]);
    }
}
</script>

<template>
    <BentoStructuredList :class="styles.list">
        <BentoStructuredListItem v-for="item in items" :key="item.id" :label="i18n.get(item.label)">
            <div v-if="getCopyValue(item)" :class="styles.copyableValue">
                <CopyText
                    :copy-button-aria-label-key="getCopyAriaLabelKey(item.id)"
                    :show-copy-text-tooltip="false"
                    :text-to-copy="getCopyValue(item)!"
                    type="Default"
                >
                    <BentoTypography variant="body">
                        {{ getCopyValue(item) }}
                    </BentoTypography>
                </CopyText>
            </div>
            <time v-else-if="item.kind === 'date'" :datetime="item.value">
                <BentoTypography variant="body">{{ formatDate(item.value) }}</BentoTypography>
            </time>
            <div v-else-if="item.kind === 'evidence'" :class="styles.listEvidence">
                <template v-for="documentType in item.value" :key="documentType">
                    <BentoTag :label="getDefenseDocumentContent(defenseDocumentConfig, i18n, documentType)?.title ?? documentType" />
                    <BentoButton
                        variant="tertiary"
                        :aria-label="i18n.get('disputes.management.details.downloadEvidence')"
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

        <BentoStructuredListItem v-for="item in extraDetails" :key="item.key" :label="i18n.get(item.key as never)">
            <CustomDetailValue :value="item.value" />
        </BentoStructuredListItem>
    </BentoStructuredList>
</template>
