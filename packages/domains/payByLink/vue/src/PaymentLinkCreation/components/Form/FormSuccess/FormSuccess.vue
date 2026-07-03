<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { BentoButton, BentoTypography } from '@adyen/bento-vue3';
import CheckmarkCircleFillIcon from '@adyen/ui-assets-icons-40/vue/checkmark-circle-filled';
import { PAYMENT_LINK_CREATION_CLASS_NAMES } from '../../../../../../domain/src';
import './FormSuccess.scss';

const props = defineProps<{
    paymentLinkUrl: string;
    onShowDetails?: () => void;
}>();

const { i18n } = useCoreContext();
const CLASS_NAMES = PAYMENT_LINK_CREATION_CLASS_NAMES;

const copied = ref(false);
let copiedTimeout: ReturnType<typeof setTimeout> | null = null;

onBeforeUnmount(() => {
    if (copiedTimeout) clearTimeout(copiedTimeout);
});

async function onCopy() {
    if (!props.paymentLinkUrl) return;
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
</script>

<template>
    <section :class="CLASS_NAMES.success">
        <div :class="CLASS_NAMES.successContent">
            <CheckmarkCircleFillIcon :class="CLASS_NAMES.successIcon" />
            <BentoTypography variant="title" medium :class="CLASS_NAMES.successTitle">
                {{ i18n.get('payByLink.creation.success.title') }}
            </BentoTypography>
            <BentoTypography variant="body" :class="CLASS_NAMES.successDescription">
                {{ i18n.get('payByLink.creation.success.description') }}
            </BentoTypography>
        </div>
        <div :class="CLASS_NAMES.successActions">
            <BentoButton variant="secondary" @click="props.onShowDetails?.()">
                {{ i18n.get('payByLink.creation.success.showDetails') }}
            </BentoButton>
            <BentoButton variant="primary" @click="onCopy">
                {{ copied ? i18n.get('payByLink.creation.success.copiedToClipboard') : i18n.get('payByLink.creation.success.copyLink') }}
            </BentoButton>
        </div>
    </section>
</template>
