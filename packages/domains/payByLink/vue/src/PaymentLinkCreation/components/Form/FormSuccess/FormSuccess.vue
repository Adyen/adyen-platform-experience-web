<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { BentoButtonActions, BentoTypography, type BentoButtonActionsList } from '@adyen/bento-vue3';
import CheckmarkCircleFillIcon from '@adyen/ui-assets-icons-40/vue/checkmark-circle-filled';
import styles from './FormSuccess.module.scss';

const props = defineProps<{
    paymentLinkUrl: string;
    onShowDetails?: () => void;
}>();

const { i18n } = useCoreContext();

const copied = ref(false);
let copiedTimeout: ReturnType<typeof setTimeout> | null = null;

onBeforeUnmount(() => {
    if (copiedTimeout) clearTimeout(copiedTimeout);
});

async function onCopy() {
    if (!props.paymentLinkUrl || !navigator.clipboard) return;
    try {
        await navigator.clipboard.writeText(props.paymentLinkUrl);
        copied.value = true;
        if (copiedTimeout) clearTimeout(copiedTimeout);
        copiedTimeout = setTimeout(() => {
            copied.value = false;
            copiedTimeout = null;
        }, 3000);
    } catch {
        // no-op
    }
}

const actionButtons = computed<BentoButtonActionsList>(() => [
    {
        title: copied.value ? i18n.get('payByLink.creation.success.copiedToClipboard') : i18n.get('payByLink.creation.success.copyLink'),
        event: onCopy,
        variant: 'primary',
    },
    {
        title: i18n.get('payByLink.creation.success.showDetails'),
        event: () => props.onShowDetails?.(),
        variant: 'secondary',
    },
]);
</script>

<template>
    <section :class="styles.root">
        <div :class="styles.content">
            <CheckmarkCircleFillIcon :class="styles.icon" />
            <BentoTypography variant="title" medium :class="styles.title">
                {{ i18n.get('payByLink.creation.success.title') }}
            </BentoTypography>
            <BentoTypography variant="body" :class="styles.description">
                {{ i18n.get('payByLink.creation.success.description') }}
            </BentoTypography>
        </div>
        <div :class="styles.actions">
            <BentoButtonActions :actions="actionButtons" layout="buttons-end" />
        </div>
    </section>
</template>
