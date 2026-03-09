<script setup lang="ts">
import { computed } from 'vue';
import { BentoStructuredList, BentoStructuredListItem, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '../../../core/Context';
import { TX_DATA_LIST } from '../constants';
import type { TransactionDetails, TransactionAmount } from '../types';

const props = defineProps<{
    transaction: TransactionDetails;
}>();

const { i18n } = useCoreContext();

interface SummaryItem {
    id?: string;
    label: string;
    value: string | null;
    strongest?: boolean;
    tooltip?: string;
}

function getFormattedAmount(amount?: TransactionAmount): string | null {
    if (!amount) return null;
    const { value, currency } = amount;
    return `${i18n.amount(value, currency, { hideCurrency: true })} ${currency}`;
}

function getAdjustmentTypeLabel(type: string): string {
    const key = `transactions.details.summary.adjustments.types.${type}`;
    return i18n.has(key) ? i18n.get(key) : type;
}

function getAdjustmentTypeInfo(type: string): string | undefined {
    const key = `transactions.details.summary.adjustmentTypes.${type}.info`;
    return i18n.has(key) ? i18n.get(key) : undefined;
}

const summaryItems = computed<SummaryItem[]>(() => {
    const { additions, deductions, amountBeforeDeductions, netAmount, originalAmount } = props.transaction;

    const items: (SummaryItem | null)[] = [
        // Original amount
        originalAmount && ((additions && additions.length > 0) || originalAmount.value !== amountBeforeDeductions.value)
            ? {
                  id: 'originalAmount',
                  label: i18n.get('transactions.details.summary.fields.originalAmount'),
                  value: getFormattedAmount(originalAmount),
              }
            : null,

        // Additions
        ...(additions?.map(({ type, ...amount }) => ({
            label: getAdjustmentTypeLabel(type),
            value: getFormattedAmount(amount),
        })) ?? []),

        // Gross amount
        { id: 'grossAmount', label: i18n.get('transactions.details.summary.fields.grossAmount'), value: getFormattedAmount(amountBeforeDeductions) },

        // Deductions
        ...(deductions?.map(({ type, ...amount }) => ({
            label: getAdjustmentTypeLabel(type),
            value: getFormattedAmount(amount),
            tooltip: getAdjustmentTypeInfo(type),
        })) ?? []),

        // Net amount
        { id: 'netAmount', label: i18n.get('transactions.details.summary.fields.netAmount'), value: getFormattedAmount(netAmount), strongest: true },
    ];

    return items.filter((item): item is SummaryItem => item !== null);
});
</script>

<template>
    <div :class="TX_DATA_LIST">
        <bento-structured-list>
            <bento-structured-list-item v-for="(item, index) in summaryItems" :key="item.id || index" :label="item.label" :label-info="item.tooltip">
                <bento-typography variant="body" :weight="item.strongest ? 'stronger' : undefined">
                    {{ item.value }}
                </bento-typography>
            </bento-structured-list-item>
        </bento-structured-list>
    </div>
</template>
