<script setup lang="ts">
import { computed, ref } from 'vue';
import { useLiveAnnouncement } from '@integration-components/composables-vue';
import {
    BentoStructuredList,
    BentoStructuredListItem,
    BentoTypography,
    BentoLink,
    BentoButton,
    BentoTooltipDirective as vBentoTooltip,
} from '@adyen/bento-vue3';
import { getTransactionRefundReason, TX_DETAILS_FIELDS_REMAPS } from '../../../../../domain/src';
import { normalizeCustomFields } from '@integration-components/utils';
import type { TransactionDetails, TransactionDetailsCustomization, TransactionsTranslationKey } from '../../../../../domain/src';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import accessibilityStyles from '@integration-components/style/accessibility.module.scss';
import styles from './PaymentDetails.module.scss';
import { useTransactionsContext } from '../../../integration/context';
import { transactionDetailsEventBridge } from '../../../events';

const props = defineProps<{
    dataCustomization?: { details?: TransactionDetailsCustomization };
    extraFields: Record<string, any> | undefined;
    transaction: TransactionDetails;
}>();

const { i18n } = useTransactionsContext();
const { announce, announcement } = useLiveAnnouncement();
const events = transactionDetailsEventBridge.useEvents();
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
} as const satisfies Record<string, TransactionsTranslationKey>;

interface ListItem {
    id?: string;
    key: TransactionsTranslationKey;
    value: string;
    copyable?: boolean;
    copyAriaLabelKey?: TransactionsTranslationKey;
    trackedField?: 'merchantReference' | 'pspReference' | 'referenceId';
}

const standardItems = computed<ListItem[]>(() => {
    const { balanceAccount, category, id, merchantReference, paymentPspReference, refundMetadata } = props.transaction;
    const account = balanceAccount?.description || balanceAccount?.id;
    const isRefund = category === 'Refund';

    const customizedFields = normalizeCustomFields(props.dataCustomization?.details?.fields, TX_DETAILS_FIELDS_REMAPS, props.transaction);
    const isVisible = customizedFields ? (fid: string) => customizedFields.find(f => f.key === fid)?.visibility !== 'hidden' : () => true;

    const items: (ListItem | null)[] = [
        account && isVisible('account') ? { id: 'account', key: paymentDataKeys.account, value: account } : null,
        isRefund && refundMetadata?.refundReason && isVisible('refundReason')
            ? {
                  id: 'refundReason',
                  key: paymentDataKeys.refundReason,
                  value: getTransactionRefundReason(i18n, refundMetadata.refundReason) as string,
              }
            : null,
        isVisible('id')
            ? {
                  id: 'id',
                  key: paymentDataKeys.id,
                  value: id,
                  copyable: true,
                  copyAriaLabelKey: paymentDataCopyButtonKeys.referenceId,
                  trackedField: 'referenceId',
              }
            : null,
        merchantReference && isVisible('merchantReference')
            ? {
                  id: 'merchantReference',
                  key: paymentDataKeys.merchantReference,
                  value: merchantReference,
                  copyable: true,
                  copyAriaLabelKey: paymentDataCopyButtonKeys.merchantReference,
                  trackedField: 'merchantReference',
              }
            : null,
        paymentPspReference && isVisible('paymentPspReference')
            ? {
                  id: 'paymentPspReference',
                  key: paymentDataKeys.pspReference,
                  value: paymentPspReference,
                  copyable: true,
                  copyAriaLabelKey: paymentDataCopyButtonKeys.pspReference,
                  trackedField: 'pspReference',
              }
            : null,
        isRefund && refundMetadata?.refundPspReference && isVisible('refundPspReference')
            ? { id: 'refundPspReference', key: paymentDataKeys.refundPspReference, value: refundMetadata.refundPspReference }
            : null,
    ];

    return items.filter(Boolean) as ListItem[];
});

const customItems = computed(() =>
    Object.entries(props.extraFields ?? {})
        .filter(([, value]) => (value as any)?.type !== 'button')
        .map(([key, value]) => ({
            key: key as TransactionsTranslationKey,
            value: (value as any)?.value ?? value,
            type: (value as any)?.type ?? 'text',
            config: (value as any)?.config,
        }))
);

function onCopyText(text: string, itemId?: string, trackedField?: ListItem['trackedField']) {
    if (!navigator.clipboard) return;

    navigator.clipboard.writeText(text);
    copiedItemId.value = itemId;

    if (trackedField) {
        events.valueCopied({ field: trackedField, transactionId: props.transaction.id });
    }

    announce(() => i18n.get('transactions.actions.copy.labels.done'));
}

function getCopyTooltip(itemId?: string) {
    const key = copiedItemId.value === itemId ? 'transactions.actions.copy.labels.done' : 'transactions.actions.copy.labels.default';
    return i18n.get(key);
}

function resetCopiedItem() {
    copiedItemId.value = undefined;
}
</script>

<template>
    <BentoStructuredList :class="styles.list">
        <BentoStructuredListItem v-for="item in standardItems" :key="item.id ?? item.key" :label="i18n.get(item.key)">
            <template v-if="item.copyable" #default>
                <div :class="styles.copyableValue">
                    <BentoTypography variant="body">{{ item.value }}</BentoTypography>
                    <BentoButton
                        variant="tertiary"
                        v-bento-tooltip="getCopyTooltip(item.id)"
                        :aria-label="item.copyAriaLabelKey ? i18n.get(item.copyAriaLabelKey) : undefined"
                        @click="() => onCopyText(item.value, item.id, item.trackedField)"
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
    <span :class="accessibilityStyles.visuallyHidden" aria-atomic="true" aria-live="polite">{{ announcement }}</span>
</template>
