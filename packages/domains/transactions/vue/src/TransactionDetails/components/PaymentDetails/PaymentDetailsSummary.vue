<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { BentoStructuredList, BentoStructuredListItem, BentoTypography } from '@adyen/bento-vue3';
import {
    getTransactionAmountAdjustmentType,
    getTransactionAmountAdjustmentTypeInformation,
    type TransactionDetails,
    type TransactionsTranslationKey,
} from '../../../../../domain/src';
import { isNullish } from '@integration-components/utils';
import type { IAmount } from '@integration-components/types';
import styles from './PaymentDetails.module.scss';

const props = defineProps<{
    transaction: TransactionDetails;
}>();

const { i18n } = useCoreContext();

const paymentAmountKeys = {
    grossAmount: 'transactions.details.summary.grossAmount',
    netAmount: 'transactions.details.summary.netAmount',
    originalAmount: 'transactions.details.summary.originalAmount',
} as const;

function formatAmount(amount?: IAmount): string | null {
    if (isNullish(amount)) return null;
    return `${i18n.amount(amount.value, amount.currency, { hideCurrency: true })} ${amount.currency}`;
}

interface SummaryItem {
    key: TransactionsTranslationKey;
    value: string | null;
    tooltip?: string | null;
    stronger?: boolean;
}

const summaryItems = computed<SummaryItem[]>(() => {
    const { additions, deductions, amountBeforeDeductions, netAmount, originalAmount } = props.transaction;

    const items: (SummaryItem | null)[] = [
        originalAmount && ((additions && additions.length > 0) || originalAmount.value !== amountBeforeDeductions.value)
            ? { key: paymentAmountKeys.originalAmount as TransactionsTranslationKey, value: formatAmount(originalAmount) }
            : null,

        ...(additions?.map(({ type, ...amount }) => ({
            key: getTransactionAmountAdjustmentType(i18n, type) as TransactionsTranslationKey,
            value: formatAmount(amount),
        })) ?? []),

        { key: paymentAmountKeys.grossAmount as TransactionsTranslationKey, value: formatAmount(amountBeforeDeductions) },

        ...(deductions?.map(({ type, ...amount }) => ({
            key: getTransactionAmountAdjustmentType(i18n, type) as TransactionsTranslationKey,
            value: formatAmount(amount),
            tooltip: getTransactionAmountAdjustmentTypeInformation(i18n, type) as string | null,
        })) ?? []),

        { key: paymentAmountKeys.netAmount as TransactionsTranslationKey, value: formatAmount(netAmount), stronger: true },
    ];

    return items.filter(Boolean) as SummaryItem[];
});
</script>

<template>
    <BentoStructuredList :class="styles.list">
        <BentoStructuredListItem v-for="item in summaryItems" :key="item.key" :label="i18n.get(item.key)" :search-tooltip="item.tooltip ?? undefined">
            <BentoTypography variant="body" :strongest="item.stronger">
                {{ item.value }}
            </BentoTypography>
        </BentoStructuredListItem>
    </BentoStructuredList>
</template>
