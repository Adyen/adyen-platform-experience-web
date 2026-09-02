<script setup lang="ts">
import { BentoStructuredList, BentoStructuredListItem, BentoTypography } from '@adyen/bento-vue3';
import type { FinancingDetailItem } from '../composables/useFinancingDetailItems';

const props = defineProps<{
    items: FinancingDetailItem[];
}>();
</script>

<template>
    <BentoStructuredList layout="50-50">
        <BentoStructuredListItem v-for="item in props.items" :key="item.key" :label="item.label" :label-info="item.info">
            <BentoTypography>
                {{ item.value }}
            </BentoTypography>
        </BentoStructuredListItem>
    </BentoStructuredList>
</template>
