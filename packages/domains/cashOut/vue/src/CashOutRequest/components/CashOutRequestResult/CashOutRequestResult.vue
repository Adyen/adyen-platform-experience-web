<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { EmptyState } from '@integration-components/composables-vue';
import type { CashOutResult } from '../../types';
import { useArrivalTime } from '../../../shared/composables/useArrivalTime';
import styles from './CashOutRequestResult.module.scss';

const props = defineProps<{
    status: CashOutResult['status'];
    /** The currency of the cashOut, which tells when its money usually arrives. */
    currency?: string;
    inModal?: boolean;
}>();

const { i18n } = useCoreContext();

const isSuccess = computed(() => props.status === 'success');

const arrivalTime = useArrivalTime(() => props.currency);

const titleKey = computed(() => (isSuccess.value ? 'cashOut.request.success.title' : 'cashOut.request.errors.title'));
const description = computed(() =>
    isSuccess.value
        ? i18n.get('cashOut.request.success.description', { values: { arrivalTime: arrivalTime.value } })
        : i18n.get('cashOut.request.errors.tryAgain')
);
</script>

<template>
    <div :class="props.inModal ? styles.inModal : undefined" :role="isSuccess ? 'status' : 'alert'">
        <EmptyState :type="isSuccess ? 'success' : 'error'" :title="i18n.get(titleKey)">{{ description }}</EmptyState>
    </div>
</template>
