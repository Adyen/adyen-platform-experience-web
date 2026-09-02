<script setup lang="ts">
import { BentoStructuredList, BentoStructuredListItem, BentoTypography } from '@adyen/bento-vue3';
import WarningIcon from '@adyen/ui-assets-icons-16/vue/warning-filled';
import type { FinancingDetailItem } from '../../composables/useFinancingDetailItems';
import styles from './FinancingDetailList.module.scss';

const props = defineProps<{
    hasBalanceAccountError?: boolean;
    items: FinancingDetailItem[];
}>();
</script>

<template>
    <BentoStructuredList layout="50-50">
        <BentoStructuredListItem v-for="item in props.items" :key="item.key" :label="item.label" :label-info="item.info">
            <BentoTypography :class="props.hasBalanceAccountError ? styles.valueWithIcon : undefined">
                <WarningIcon
                    v-if="props.hasBalanceAccountError && item.key === 'account'"
                    :class="styles.icon"
                    data-testid="primary-account-warning-icon"
                    aria-hidden="true"
                />
                {{ item.value }}
            </BentoTypography>
        </BentoStructuredListItem>
    </BentoStructuredList>
</template>
