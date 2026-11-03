<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { LiveAnnouncement, ResponsiveButtonActions, useCopyText, useLiveAnnouncement } from '@integration-components/composables-vue';
import { BentoTypography, type BentoButtonActionsList } from '@adyen/bento-vue3';
import CheckmarkCircleFillIcon from '@adyen/ui-assets-icons-40/vue/checkmark-circle-filled';
import styles from './FormSuccess.module.scss';

const COPIED_LABEL_DURATION = 3000;

const props = defineProps<{
    paymentLinkUrl: string;
    onShowDetails?: () => void;
}>();

const { i18n } = useCoreContext();
const { announce, announcement } = useLiveAnnouncement();

let copiedTimeout: ReturnType<typeof setTimeout> | null = null;

const { copyText, isCopied, resetCopyState } = useCopyText(
    () => props.paymentLinkUrl,
    () => {
        announce(() => i18n.get('payByLink.creation.success.copy.done'));
        if (copiedTimeout) clearTimeout(copiedTimeout);
        copiedTimeout = setTimeout(() => {
            resetCopyState();
            copiedTimeout = null;
        }, COPIED_LABEL_DURATION);
    }
);

onBeforeUnmount(() => {
    if (copiedTimeout) clearTimeout(copiedTimeout);
});

const actionButtons = computed<BentoButtonActionsList>(() => [
    {
        title: isCopied.value ? i18n.get('payByLink.creation.success.copy.done') : i18n.get('payByLink.creation.success.copy.link'),
        event: copyText,
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
        <ResponsiveButtonActions :actions="actionButtons" />
        <LiveAnnouncement :message="announcement" />
    </section>
</template>
