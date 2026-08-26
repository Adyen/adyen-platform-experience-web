<script setup lang="ts">
import { computed } from 'vue';
import { BentoTypography } from '@adyen/bento-vue3';
import { getRenewalAmountBreakdown } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import type { IAmount } from '@integration-components/types';
import styles from './RenewalHighlightedFields.module.scss';

const props = defineProps<{
    newGrantAmountValue: number;
    remainingGrantAmount: IAmount;
}>();

const { i18n } = useCoreContext();

const fields = computed(() => {
    const breakdown = getRenewalAmountBreakdown(props.newGrantAmountValue, props.remainingGrantAmount);
    const formatAmount = (value: number) => i18n.amount(value, breakdown.currency, { minimumFractionDigits: 0 });

    return [
        {
            label: i18n.get('capital.offer.selection.earlyRenewal.newGrantAmount'),
            value: formatAmount(breakdown.newGrantAmountValue),
        },
        { value: '-' },
        {
            label: i18n.get('capital.offer.selection.earlyRenewal.currentGrantAmount'),
            value: formatAmount(breakdown.remainingGrantAmountValue),
        },
        { value: '=' },
        {
            label: i18n.get('capital.offer.selection.earlyRenewal.amountToReceive'),
            value: formatAmount(breakdown.amountToReceive),
        },
    ];
});
</script>

<template>
    <div :class="styles.root">
        <div v-for="field in fields" :key="field.label ?? field.value" :class="styles.item">
            <BentoTypography v-if="field.label" variant="caption" :class="styles.label">
                {{ field.label }}
            </BentoTypography>
            <BentoTypography variant="body" strongest>
                {{ field.value }}
            </BentoTypography>
        </div>
    </div>
</template>
