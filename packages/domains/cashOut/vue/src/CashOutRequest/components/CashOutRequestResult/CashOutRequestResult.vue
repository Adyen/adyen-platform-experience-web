<script setup lang="ts">
import { computed } from 'vue';
import type { BentoButtonActionsList } from '@adyen/bento-vue3';
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
    /** Shows the form again, so a cashOut rejected because what is available changed can be tried again with what is available by then. */
    onTryAgain?: () => void;
}>();

const { i18n } = useCoreContext();

const isSuccess = computed(() => props.status === 'success');

const arrivalTime = useArrivalTime(() => props.currency);

const title = computed(() => {
    switch (props.status) {
        case 'success':
            return i18n.get('cashOut.request.success.title');
        case 'balanceChanged':
            return i18n.get('cashOut.request.errors.balanceChanged.title');
        default:
            return i18n.get('cashOut.request.errors.title');
    }
});

const description = computed(() => {
    switch (props.status) {
        case 'success':
            return i18n.get('cashOut.request.success.description', { values: { arrivalTime: arrivalTime.value } });
        case 'balanceChanged':
            return i18n.get('cashOut.request.errors.balanceChanged.description');
        default:
            return i18n.get('cashOut.request.errors.tryAgain');
    }
});

const actions = computed<BentoButtonActionsList>(() =>
    props.status === 'balanceChanged' && props.onTryAgain ? [{ title: i18n.get('cashOut.request.actions.tryAgain'), event: props.onTryAgain }] : []
);
</script>

<template>
    <div :class="props.inModal ? styles.inModal : undefined" :role="isSuccess ? 'status' : 'alert'">
        <EmptyState :type="isSuccess ? 'success' : 'error'" :title="title" :actions="actions">{{ description }}</EmptyState>
    </div>
</template>
