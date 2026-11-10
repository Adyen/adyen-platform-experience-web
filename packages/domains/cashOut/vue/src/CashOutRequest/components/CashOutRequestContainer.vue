<script setup lang="ts">
import { useShouldHideTitles } from '@integration-components/composables-vue';
import type { CashOutRequestExternalProps } from '../types';
import CashOutRequest from './CashOutRequest/CashOutRequest.vue';

// Undeclared props, like an `onContactSupport` from an untyped integration, must not fall through to CashOutRequest.
defineOptions({ inheritAttrs: false });

const props = defineProps<Omit<CashOutRequestExternalProps, 'core'>>();
const hideTitles = useShouldHideTitles();
</script>

<template>
    <CashOutRequest v-bind="props" :hide-title="hideTitles" />
</template>
