<script setup lang="ts">
import { computed } from 'vue';
import { BentoButtonActions, BentoTypography, type BentoButtonActionsList } from '@adyen/bento-vue3';
import SuccessIcon from '@adyen/ui-assets-icons-40/vue/checkmark-circle-filled';
import { useCoreContext } from '@integration-components/core/vue';
import { useResponsiveContainer, containerQueries } from '@integration-components/composables-vue';
import styles from './PaymentLinkExpirationSuccess.module.scss';

const props = defineProps<{
    onDismiss?: () => void;
    onShowDetails: () => void;
}>();

const { i18n } = useCoreContext();
const isMobile = useResponsiveContainer(containerQueries.down.xs);

const actionButtons = computed<BentoButtonActionsList>(() => [
    ...(props.onDismiss
        ? [{ title: i18n.get('payByLink.details.expirationSuccess.actions.goBackToList'), event: props.onDismiss, variant: 'secondary' as const }]
        : []),
    {
        title: i18n.get('payByLink.details.expirationSuccess.actions.showDetails'),
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
        <BentoButtonActions
            :actions="actionButtons"
            :layout="isMobile ? 'stacked-buttons' : 'fill-container'"
            :class="[styles.actions, isMobile ? styles.actionsStacked : undefined]"
        />
    </div>
</template>
