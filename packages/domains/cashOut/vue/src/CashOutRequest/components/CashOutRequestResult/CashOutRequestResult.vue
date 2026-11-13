<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { EmptyState } from '@integration-components/composables-vue';
import type { CashOutResult } from '../../types';

const props = defineProps<{
    status: CashOutResult['status'];
}>();

const { i18n } = useCoreContext();

const isSuccess = computed(() => props.status === 'success');

const titleKey = computed(() => (isSuccess.value ? 'cashOut.request.success.title' : 'cashOut.common.errors.somethingWentWrong'));
const descriptionKey = computed(() => (isSuccess.value ? 'cashOut.request.success.description' : 'cashOut.request.errors.tryAgain'));
</script>

<template>
    <div :role="isSuccess ? 'status' : 'alert'">
        <EmptyState :type="isSuccess ? 'success' : 'error'" :title="i18n.get(titleKey)">{{ i18n.get(descriptionKey) }}</EmptyState>
    </div>
</template>
