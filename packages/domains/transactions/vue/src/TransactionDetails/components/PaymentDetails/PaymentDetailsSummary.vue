<script setup lang="ts">
import { computed } from 'vue';
import { BentoStructuredList, BentoStructuredListItem, BentoTypography } from '@adyen/bento-vue3';
import { getTransactionAmountAdjustmentType, getTransactionAmountAdjustmentTypeInformation } from '../../../../../domain/src';
import { isNullish } from '@integration-components/utils';
import type { TransactionDetails } from '../../../../../domain/src';
import type { IAmount } from '@integration-components/types';
import styles from './PaymentDetails.module.scss';
import { useTransactionsContext } from '../../../integration/context';

const props = defineProps<{
    transaction: TransactionDetails;
}>();

const { i18n } = useTransactionsContext();

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
    key: string;
    value: string | null;
    tooltip?: string | null;
    stronger?: boolean;
}

const summaryItems = computed<SummaryItem[]>(() => {
    const { additions, deductions, amountBeforeDeductions, netAmount, originalAmount } = props.transaction;

    const items: (SummaryItem | null)[] = [
        originalAmount && ((additions && additions.length > 0) || originalAmount.value !== amountBeforeDeductions.value)
            ? { key: i18n.get(paymentAmountKeys.originalAmount), value: formatAmount(originalAmount) }
            : null,

        ...(additions?.map(({ type, ...amount }) => ({
            key: getTransactionAmountAdjustmentType(i18n, type),
            value: formatAmount(amount),
        })) ?? []),

        { key: i18n.get(paymentAmountKeys.grossAmount), value: formatAmount(amountBeforeDeductions) },

        ...(deductions?.map(({ type, ...amount }) => ({
            key: getTransactionAmountAdjustmentType(i18n, type),
            value: formatAmount(amount),
            tooltip: getTransactionAmountAdjustmentTypeInformation(i18n, type) as string | null,
        })) ?? []),

        { key: i18n.get(paymentAmountKeys.netAmount), value: formatAmount(netAmount), stronger: true },
    ];

    return items.filter(Boolean) as SummaryItem[];
});
</script>

<template>
    <BentoStructuredList :class="styles.list">
        <BentoStructuredListItem v-for="item in summaryItems" :key="item.key" :label="item.key" :search-tooltip="item.tooltip ?? undefined">
            <BentoTypography variant="body" :strongest="item.stronger">
                {{ item.value }}
            </BentoTypography>
        </BentoStructuredListItem>
    </BentoStructuredList>
</template>
