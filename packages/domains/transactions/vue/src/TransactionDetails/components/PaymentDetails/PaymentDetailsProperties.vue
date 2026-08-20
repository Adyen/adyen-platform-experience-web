<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import { useLiveAnnouncement } from '@integration-components/composables-vue';
import {
    BentoStructuredList,
    BentoStructuredListItem,
    BentoTypography,
    BentoLink,
    BentoButton,
    BentoTooltipDirective as vBentoTooltip,
} from '@adyen/bento-vue3';
import {
    getTransactionRefundReason,
    TX_DATA_COPYABLE_VALUE,
    TX_DATA_LIST,
    TX_DETAILS_FIELDS_REMAPS,
    sharedTransactionDetailsEventProperties,
} from '../../../../../domain/src';
import { normalizeCustomFields } from '@integration-components/utils';
import type { TransactionDetails, TransactionDetailsCustomization } from '../../../../../domain/src';
import type { TranslationKey } from '@integration-components/core';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';

const props = defineProps<{
    dataCustomization?: { details?: TransactionDetailsCustomization };
    extraFields: Record<string, any> | undefined;
    transaction: TransactionDetails;
}>();

const { i18n } = useCoreContext();
const { announce, announcement } = useLiveAnnouncement();
const userEvents = useEventDispatcherContext();
const copiedItemId = ref<string>();

const paymentDataKeys = {
    account: 'transactions.details.fields.account',
    id: 'transactions.details.fields.referenceID',
    merchantReference: 'transactions.details.fields.merchantReference',
    pspReference: 'transactions.details.fields.pspReference',
    refundPspReference: 'transactions.details.fields.refundPspReference',
    refundReason: 'transactions.details.fields.refundReason',
} as const;

const paymentDataCopyButtonKeys = {
    referenceId: 'transactions.details.actions.copyReferenceID',
    merchantReference: 'transactions.details.actions.copyMerchantReference',
    pspReference: 'transactions.details.actions.copyPspReference',
} as const satisfies Record<string, TranslationKey>;

interface ListItem {
    id?: string;
    key: TranslationKey;
    value: string;
    copyable?: boolean;
    copyAriaLabelKey?: TranslationKey;
    trackingName?: string;
}

const standardItems = computed<ListItem[]>(() => {
    const { balanceAccount, category, id, merchantReference, paymentPspReference, refundMetadata } = props.transaction;
    const account = balanceAccount?.description || balanceAccount?.id;
    const isRefund = category === 'Refund';

    const customizedFields = normalizeCustomFields(props.dataCustomization?.details?.fields, TX_DETAILS_FIELDS_REMAPS, props.transaction);
    const isVisible = customizedFields ? (fid: string) => customizedFields.find(f => f.key === fid)?.visibility !== 'hidden' : () => true;

    const items: (ListItem | null)[] = [
        account && isVisible('account') ? { id: 'account', key: paymentDataKeys.account as TranslationKey, value: account } : null,
        isRefund && refundMetadata?.refundReason && isVisible('refundReason')
            ? {
                  id: 'refundReason',
                  key: paymentDataKeys.refundReason as TranslationKey,
                  value: getTransactionRefundReason(i18n, refundMetadata.refundReason) as string,
              }
            : null,
        isVisible('id')
            ? {
                  id: 'id',
                  key: paymentDataKeys.id as TranslationKey,
                  value: id,
                  copyable: true,
                  copyAriaLabelKey: paymentDataCopyButtonKeys.referenceId,
                  trackingName: 'Reference ID',
              }
            : null,
        merchantReference && isVisible('merchantReference')
            ? {
                  id: 'merchantReference',
                  key: paymentDataKeys.merchantReference as TranslationKey,
                  value: merchantReference,
                  copyable: true,
                  copyAriaLabelKey: paymentDataCopyButtonKeys.merchantReference,
                  trackingName: 'Merchant reference',
              }
            : null,
        paymentPspReference && isVisible('paymentPspReference')
            ? {
                  id: 'paymentPspReference',
                  key: paymentDataKeys.pspReference as TranslationKey,
                  value: paymentPspReference,
                  copyable: true,
                  copyAriaLabelKey: paymentDataCopyButtonKeys.pspReference,
                  trackingName: 'PSP reference',
              }
            : null,
        isRefund && refundMetadata?.refundPspReference && isVisible('refundPspReference')
            ? { id: 'refundPspReference', key: paymentDataKeys.refundPspReference as TranslationKey, value: refundMetadata.refundPspReference }
            : null,
    ];

    return items.filter(Boolean) as ListItem[];
});

const customItems = computed(() =>
    Object.entries(props.extraFields ?? {})
        .filter(([, value]) => (value as any)?.type !== 'button')
        .map(([key, value]) => ({
            key: key as TranslationKey,
            value: (value as any)?.value ?? value,
            type: (value as any)?.type ?? 'text',
            config: (value as any)?.config,
        }))
);

function onCopyText(text: string, itemId?: string, trackingName?: string) {
    navigator.clipboard?.writeText(text);
    copiedItemId.value = itemId;

    if (trackingName) {
        userEvents.addEvent?.('Clicked button', {
            ...sharedTransactionDetailsEventProperties,
            sectionName: 'Details',
            label: 'Copy button',
            subSectionName: trackingName,
        });
    }

    announce(() => i18n.get('common.actions.copy.labels.done'));
}

function getCopyTooltip(itemId?: string) {
    const key = copiedItemId.value === itemId ? 'common.actions.copy.labels.done' : 'common.actions.copy.labels.default';
    return i18n.get(key);
}

function resetCopiedItem() {
    copiedItemId.value = undefined;
}
</script>

<template>
    <BentoStructuredList :class="TX_DATA_LIST">
        <BentoStructuredListItem v-for="item in standardItems" :key="item.id ?? item.key" :label="i18n.get(item.key)">
            <template v-if="item.copyable" #default>
                <div :class="TX_DATA_COPYABLE_VALUE">
                    <BentoTypography variant="body">{{ item.value }}</BentoTypography>
                    <BentoButton
                        variant="tertiary"
                        v-bento-tooltip="getCopyTooltip(item.id)"
                        :aria-label="item.copyAriaLabelKey ? i18n.get(item.copyAriaLabelKey) : undefined"
                        @click="() => onCopyText(item.value, item.id, item.trackingName)"
                        @blur="resetCopiedItem"
                        @mouseleave="resetCopiedItem"
                    >
                        <CopyIcon />
                    </BentoButton>
                </div>
            </template>
            <template v-else #default>
                <BentoTypography variant="body">{{ item.value }}</BentoTypography>
            </template>
        </BentoStructuredListItem>

        <BentoStructuredListItem v-for="item in customItems" :key="item.key" :label="i18n.get(item.key)">
            <BentoLink
                v-if="item.type === 'link' && item.config"
                :class="item.config.className"
                :to="item.config.href"
                :target="item.config.target || '_blank'"
                rel="noopener noreferrer"
                external
            >
                {{ item.value }}
            </BentoLink>
            <div v-else-if="item.type === 'icon' && item.config" :class="item.config.className">
                <img :src="item.config.src" :alt="item.config.alt || item.value" />
                <BentoTypography variant="body">{{ item.value }}</BentoTypography>
            </div>
            <BentoTypography v-else variant="body" :class="item.config?.className">{{ item.value }}</BentoTypography>
        </BentoStructuredListItem>
    </BentoStructuredList>
    <span class="adyen-pe-visually-hidden" aria-atomic="true" aria-live="polite">{{ announcement }}</span>
</template>
