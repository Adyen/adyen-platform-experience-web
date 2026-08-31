<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { BentoButtonActions, type BentoButtonActionsList } from '@adyen/bento-vue3';
import CheckmarkIcon from '@adyen/ui-assets-icons-16/vue/checkmark';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import type { IPaymentLinkDetails } from '@integration-components/types';
import PaymentLinkSummary from '../PaymentLinkSummary/PaymentLinkSummary.vue';
import PaymentLinkTabs from '../PaymentLinkTabs/PaymentLinkTabs.vue';
import { isFunction } from '@integration-components/utils';
import { usePayByLinkContext } from '../../../integration/context';

const props = defineProps<{
    paymentLink: IPaymentLinkDetails;
    onDismiss?: () => void;
    onExpire: () => void;
    isDismissButtonHidden?: boolean;
}>();

const { i18n, runtime } = usePayByLinkContext();
const isCopiedIndicatorVisible = ref(false);

let copiedTimeout: ReturnType<typeof setTimeout> | undefined;

onUnmounted(() => clearTimeout(copiedTimeout));

async function handleCopyLink() {
    if (!navigator.clipboard) return;
    try {
        await navigator.clipboard.writeText(props.paymentLink.linkInformation.paymentLink);
        isCopiedIndicatorVisible.value = true;
        clearTimeout(copiedTimeout);
        copiedTimeout = setTimeout(() => (isCopiedIndicatorVisible.value = false), 3000);
    } catch {
        // ignore clipboard errors
    }
}

const actionButtons = computed<BentoButtonActionsList>(() => {
    const status = props.paymentLink.linkInformation.status;

    return [
        ...(navigator.clipboard
            ? [
                  {
                      title: i18n.get(isCopiedIndicatorVisible.value ? 'payByLink.details.actions.copied' : 'payByLink.details.actions.copyLink'),
                      event: handleCopyLink,
                      variant: 'primary',
                      iconLeft: isCopiedIndicatorVisible.value ? CheckmarkIcon : CopyIcon,
                  } as const,
              ]
            : []),
        ...(status !== 'expired' && status !== 'completed' && isFunction(runtime.endpoints.expirePayByLinkPaymentLink)
            ? [{ title: i18n.get('payByLink.details.actions.expire'), event: props.onExpire, variant: 'secondary' as const }]
            : []),
        ...(!props.isDismissButtonHidden && props.onDismiss
            ? [{ title: i18n.get('payByLink.common.actions.goBack'), event: props.onDismiss, variant: 'secondary' as const }]
            : []),
    ];
});
</script>

<template>
    <PaymentLinkSummary :payment-link="props.paymentLink" />
    <PaymentLinkTabs :payment-link="props.paymentLink" />
    <BentoButtonActions :actions="actionButtons" />
</template>
