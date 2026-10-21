<script setup lang="ts">
import { useShouldHideTitles } from '@integration-components/composables-vue';
import type { CashOutRequestProps } from '../types';
import CashOutRequest from './CashOutRequest/CashOutRequest.vue';

const props = defineProps<Omit<CashOutRequestProps, 'hideTitle'>>();
const hideTitles = useShouldHideTitles();
</script>

<template>
    <CashOutRequest v-bind="props" :hide-title="hideTitles" />
</template>
