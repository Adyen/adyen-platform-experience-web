<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { BentoStructuredList, BentoStructuredListItem, BentoTypography } from '@adyen/bento-vue3';
import {
    getTransactionAmountAdjustmentType,
    getTransactionAmountAdjustmentTypeInformation,
    TX_DATA_LIST,
} from '@integration-components/transactions/domain';
import { isNullish } from '@integration-components/utils';
import type { TransactionDetails } from '@integration-components/transactions/domain';
import type { IAmount } from '@integration-components/types';
import type { TranslationKey } from '@integration-components/core';

const props = defineProps<{
    transaction: TransactionDetails;
}>();

const { i18n } = useCoreContext();

const paymentAmountKeys = {
    grossAmount: 'transactions.details.summary.fields.grossAmount',
    netAmount: 'transactions.details.summary.fields.netAmount',
    originalAmount: 'transactions.details.summary.fields.originalAmount',
} as const;

function formatAmount(amount?: IAmount): string | null {
    if (isNullish(amount)) return null;
    return `${i18n.amount(amount.value, amount.currency, { hideCurrency: true })} ${amount.currency}`;
}

interface SummaryItem {
    key: TranslationKey;
    value: string | null;
    tooltip?: string | null;
    stronger?: boolean;
}

const summaryItems = computed<SummaryItem[]>(() => {
    const { additions, deductions, amountBeforeDeductions, netAmount, originalAmount } = props.transaction;

    const items: (SummaryItem | null)[] = [
        originalAmount && ((additions && additions.length > 0) || originalAmount.value !== amountBeforeDeductions.value)
            ? { key: paymentAmountKeys.originalAmount as TranslationKey, value: formatAmount(originalAmount) }
            : null,

        ...(additions?.map(({ type, ...amount }) => ({
            key: getTransactionAmountAdjustmentType(i18n, type) as TranslationKey,
            value: formatAmount(amount),
        })) ?? []),

        { key: paymentAmountKeys.grossAmount as TranslationKey, value: formatAmount(amountBeforeDeductions) },

        ...(deductions?.map(({ type, ...amount }) => ({
            key: getTransactionAmountAdjustmentType(i18n, type) as TranslationKey,
            value: formatAmount(amount),
            tooltip: getTransactionAmountAdjustmentTypeInformation(i18n, type) as string | null,
        })) ?? []),

        { key: paymentAmountKeys.netAmount as TranslationKey, value: formatAmount(netAmount), stronger: true },
    ];

    return items.filter(Boolean) as SummaryItem[];
});
</script>

<template>
    <BentoStructuredList :class="TX_DATA_LIST">
        <BentoStructuredListItem v-for="item in summaryItems" :key="item.key" :label="i18n.get(item.key)" :search-tooltip="item.tooltip ?? undefined">
            <BentoTypography variant="body" :strongest="item.stronger">{{ item.value }}</BentoTypography>
        </BentoStructuredListItem>
    </BentoStructuredList>
</template>
