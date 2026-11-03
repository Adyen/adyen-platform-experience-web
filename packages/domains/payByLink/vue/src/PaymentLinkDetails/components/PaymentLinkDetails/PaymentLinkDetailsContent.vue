<script setup lang="ts">
import { computed, onUnmounted } from 'vue';
import { BentoButtonActions, type BentoButtonActionsList } from '@adyen/bento-vue3';
import CheckmarkIcon from '@adyen/ui-assets-icons-16/vue/checkmark';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import { useConfigContext, useCoreContext } from '@integration-components/core/vue';
import { LiveAnnouncement, useCopyText, useLiveAnnouncement } from '@integration-components/composables-vue';
import type { IPaymentLinkDetails } from '@integration-components/types';
import PaymentLinkSummary from '../PaymentLinkSummary/PaymentLinkSummary.vue';
import PaymentLinkTabs from '../PaymentLinkTabs/PaymentLinkTabs.vue';
import { isFunction } from '@integration-components/utils';

const COPIED_LABEL_DURATION = 3000;

const props = defineProps<{
    paymentLink: IPaymentLinkDetails;
    onExpire: () => void;
}>();

const { i18n } = useCoreContext();
const config = useConfigContext();
const { announce, announcement } = useLiveAnnouncement();

let copiedTimeout: ReturnType<typeof setTimeout> | undefined;

const { copyText, isCopied, resetCopyState } = useCopyText(
    () => props.paymentLink.linkInformation.paymentLink,
    () => {
        announce(() => i18n.get('payByLink.details.copy.done'));
        clearTimeout(copiedTimeout);
        copiedTimeout = setTimeout(resetCopyState, COPIED_LABEL_DURATION);
    }
);

onUnmounted(() => clearTimeout(copiedTimeout));

const actionButtons = computed<BentoButtonActionsList>(() => {
    const status = props.paymentLink.linkInformation.status;

    return [
        ...(navigator.clipboard
            ? [
                  {
                      title: i18n.get(isCopied.value ? 'payByLink.details.copy.done' : 'payByLink.details.copy.link'),
                      event: copyText,
                      variant: 'primary',
                      iconLeft: isCopied.value ? CheckmarkIcon : CopyIcon,
                  } as const,
              ]
            : []),
        ...(status !== 'expired' && status !== 'completed' && isFunction(config.endpoints.expirePayByLinkPaymentLink)
            ? [{ title: i18n.get('payByLink.details.actions.expire'), event: props.onExpire, variant: 'secondary' as const }]
            : []),
    ];
});
</script>

<template>
    <PaymentLinkSummary :payment-link="props.paymentLink" />
    <PaymentLinkTabs :payment-link="props.paymentLink" />
    <BentoButtonActions :actions="actionButtons" />
    <LiveAnnouncement :message="announcement" />
</template>
