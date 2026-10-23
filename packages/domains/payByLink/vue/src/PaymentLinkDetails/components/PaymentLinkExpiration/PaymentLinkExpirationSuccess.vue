<script setup lang="ts">
import { computed } from 'vue';
import { BentoTypography, type BentoButtonActionsList } from '@adyen/bento-vue3';
import SuccessIcon from '@adyen/ui-assets-icons-40/vue/checkmark-circle-filled';
import { useCoreContext } from '@integration-components/core/vue';
import { ResponsiveButtonActions } from '@integration-components/composables-vue';
import styles from './PaymentLinkExpirationSuccess.module.scss';

const props = defineProps<{
    onShowDetails: () => void;
}>();

const { i18n } = useCoreContext();

const actionButtons = computed<BentoButtonActionsList>(() => [
    {
        title: i18n.get('payByLink.details.expirationSuccess.showDetails'),
        event: props.onShowDetails,
        variant: 'secondary',
    },
]);
</script>

<template>
    <div :class="styles.root">
        <SuccessIcon :class="styles.icon" aria-hidden="true" />
        <BentoTypography variant="title">
            {{ i18n.get('payByLink.details.expirationSuccess.title') }}
        </BentoTypography>
        <BentoTypography variant="body">
            {{ i18n.get('payByLink.details.expirationSuccess.description') }}
        </BentoTypography>
        <ResponsiveButtonActions :actions="actionButtons" />
    </div>
</template>
