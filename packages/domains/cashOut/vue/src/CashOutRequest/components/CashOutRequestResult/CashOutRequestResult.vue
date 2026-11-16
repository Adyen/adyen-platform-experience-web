<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { EmptyState } from '@integration-components/composables-vue';
import type { CashOutResult } from '../../types';
import styles from './CashOutRequestResult.module.scss';

const props = defineProps<{
    status: CashOutResult['status'];
    inModal?: boolean;
}>();

const { i18n } = useCoreContext();

const isSuccess = computed(() => props.status === 'success');

const titleKey = computed(() => (isSuccess.value ? 'cashOut.request.success.title' : 'cashOut.request.errors.title'));
// TODO: the arrival time differs per currency; take the success description from the CDN values per currency once they are available.
const descriptionKey = computed(() => (isSuccess.value ? 'cashOut.request.success.description' : 'cashOut.request.errors.tryAgain'));
</script>

<template>
    <div :class="props.inModal ? styles.inModal : undefined" :role="isSuccess ? 'status' : 'alert'">
        <EmptyState :type="isSuccess ? 'success' : 'error'" :title="i18n.get(titleKey)">{{ i18n.get(descriptionKey) }}</EmptyState>
    </div>
</template>
