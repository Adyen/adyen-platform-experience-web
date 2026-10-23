<script setup lang="ts">
import { computed } from 'vue';
import { BentoTypography, type BentoButtonActionsList } from '@adyen/bento-vue3';
import CheckmarkCircleIcon from '@adyen/ui-assets-icons-40/vue/checkmark-circle';
import CrossCircleIcon from '@adyen/ui-assets-icons-40/vue/cross-circle';
import { useCoreContext } from '@integration-components/core/vue';
import { ResponsiveButtonActions } from '@integration-components/composables-vue';
import type { CashOutResult } from '../../types';
import styles from './CashOutRequestResult.module.scss';

const props = defineProps<{
    status: CashOutResult['status'];
    onDismiss?: () => void;
}>();

const { i18n } = useCoreContext();

const isSuccess = computed(() => props.status === 'success');

const titleKey = computed(() => (isSuccess.value ? 'cashOut.request.success.title' : 'cashOut.common.errors.somethingWentWrong'));
const descriptionKey = computed(() => (isSuccess.value ? 'cashOut.request.success.description' : 'cashOut.request.errors.tryAgain'));

// In a modal there is no onDismiss: the modal's own close button closes it.
const actions = computed<BentoButtonActionsList>(() =>
    props.onDismiss ? [{ title: i18n.get('cashOut.common.actions.close.labels.default'), event: props.onDismiss, variant: 'secondary' }] : []
);
</script>

<template>
    <div :class="styles.root" :role="isSuccess ? 'status' : 'alert'">
        <CheckmarkCircleIcon v-if="isSuccess" :class="[styles.icon, styles.iconSuccess]" aria-hidden="true" />
        <CrossCircleIcon v-else :class="[styles.icon, styles.iconError]" aria-hidden="true" />
        <div :class="styles.text">
            <BentoTypography variant="title">{{ i18n.get(titleKey) }}</BentoTypography>
            <BentoTypography :class="styles.description" variant="body">{{ i18n.get(descriptionKey) }}</BentoTypography>
        </div>
        <ResponsiveButtonActions v-if="actions.length" :actions="actions" />
    </div>
</template>
