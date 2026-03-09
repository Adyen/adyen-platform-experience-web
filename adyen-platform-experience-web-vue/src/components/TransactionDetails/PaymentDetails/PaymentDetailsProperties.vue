<script setup lang="ts">
import { computed } from 'vue';
import { BentoStructuredList, BentoStructuredListItem, BentoTypography, BentoLink } from '@adyen/bento-vue3';
import { useCoreContext } from '../../../core/Context';
import { TX_DATA_LABEL, TX_DATA_LIST, TX_DETAILS_FIELDS_REMAPS } from '../constants';
import { normalizeCustomFields } from '../utils';
import { REFUND_REASONS_KEYS } from '../constants';
import type { TransactionDetails, TransactionDetailsProps } from '../types';

const props = defineProps<{
    dataCustomization?: TransactionDetailsProps['dataCustomization'];
    extraFields: Record<string, any> | undefined;
    transaction: TransactionDetails;
}>();

const { i18n } = useCoreContext();

function getTransactionRefundReason(reason: string): string {
    const key = REFUND_REASONS_KEYS[reason];
    if (key && i18n.has(key)) return i18n.get(key);
    return reason;
}

interface ListItem {
    id?: string;
    label: string;
    value: string;
    copyable?: boolean;
    type?: string;
    config?: Record<string, any>;
}

const standardProperties = computed<ListItem[]>(() => {
    const { balanceAccount, category, id, merchantReference, paymentPspReference, refundMetadata } = props.transaction;
    const account = balanceAccount?.description || balanceAccount?.id;
    const isRefundTransaction = category === 'Refund';

    const customizedFields = normalizeCustomFields(props.dataCustomization?.details?.fields, TX_DETAILS_FIELDS_REMAPS, props.transaction);
    const isVisibleField = customizedFields
        ? (fieldId: string) => customizedFields.find(field => field.key === fieldId)?.visibility !== 'hidden'
        : () => true;

    const items: (ListItem | null)[] = [
        account && isVisibleField('account') ? { id: 'account', label: i18n.get('transactions.details.fields.account'), value: account } : null,

        isRefundTransaction && refundMetadata?.refundReason && isVisibleField('refundReason')
            ? {
                  id: 'refundReason',
                  label: i18n.get('transactions.details.fields.refundReason'),
                  value: getTransactionRefundReason(refundMetadata.refundReason),
              }
            : null,

        isVisibleField('id') ? { id: 'id', label: i18n.get('transactions.details.fields.referenceID'), value: id, copyable: true } : null,

        merchantReference && isVisibleField('merchantReference')
            ? { id: 'merchantReference', label: i18n.get('transactions.details.fields.merchantReference'), value: merchantReference, copyable: true }
            : null,

        paymentPspReference && isVisibleField('paymentPspReference')
            ? { id: 'paymentPspReference', label: i18n.get('transactions.details.fields.pspReference'), value: paymentPspReference, copyable: true }
            : null,

        isRefundTransaction && refundMetadata?.refundPspReference && isVisibleField('refundPspReference')
            ? {
                  id: 'refundPspReference',
                  label: i18n.get('transactions.details.fields.refundPspReference'),
                  value: refundMetadata.refundPspReference,
              }
            : null,
    ];

    return items.filter((item): item is ListItem => item !== null);
});

const customProperties = computed<ListItem[]>(() => {
    if (!props.extraFields) return [];
    return Object.entries(props.extraFields)
        .filter(([, value]) => value?.type !== 'button')
        .map(([key, value]) => {
            const isCustomObj = value && typeof value === 'object' && 'value' in value;
            return {
                label: key,
                value: isCustomObj ? value.value : value,
                type: isCustomObj ? value.type : 'text',
                config: isCustomObj ? value.config : undefined,
            };
        });
});

const allProperties = computed(() => [...standardProperties.value, ...customProperties.value]);

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    });
}
</script>

<template>
    <div :class="TX_DATA_LIST">
        <bento-structured-list>
            <bento-structured-list-item v-for="item in allProperties" :key="item.id || item.label" :label="item.label">
                <template #label>
                    <div :class="TX_DATA_LABEL">{{ item.label }}</div>
                </template>
                <!-- <template #value> -->
                <template v-if="item.config?.href">
                    <bento-link :to="item.config.href" :target="item.config.target || '_blank'">
                        {{ item.value }}
                    </bento-link>
                </template>
                <template v-else>
                    <div style="display: flex; align-items: center; gap: 4px">
                        <bento-typography variant="body">{{ item.value }}</bento-typography>
                        <button
                            v-if="item.copyable"
                            style="background: none; border: none; cursor: pointer; padding: 2px; opacity: 0.6"
                            :aria-label="i18n.get('transactions.details.actions.copyReferenceID')"
                            @click="copyToClipboard(item.value)"
                        >
                            &#x2398;
                        </button>
                    </div>
                </template>
                <!-- </template> -->
            </bento-structured-list-item>
        </bento-structured-list>
    </div>
</template>
