<script setup lang="ts">
import { computed } from 'vue';
import { BentoButton, BentoTypography } from '@adyen/bento-vue3';
import { type AssetOptions, useCoreContext } from '@integration-components/core/vue';
import { getPaymentLinkErrorMessageContent } from '@integration-components/payByLink/domain';
import type { PaymentLinkDetailsError } from '../../composables/usePaymentLinkDetails';
import './PaymentLinkDetailsError.scss';

const CLASSNAMES = {
    root: 'adyen-pe-payment-link-details-error',
    actions: 'adyen-pe-payment-link-details-error__actions',
};

const props = defineProps<{
    error?: PaymentLinkDetailsError;
    onContactSupport?: () => void;
    onDismiss?: () => void;
    onRefetch: () => void;
}>();

const { i18n, getImageAsset } = useCoreContext();

const getErrorImage = (forSmallViewport = false) => {
    const options: AssetOptions = { name: 'wrong-environment' };
    if (forSmallViewport) options.subFolder = 'images/small';
    return getImageAsset?.(options);
};

const errorContent = computed(() => getPaymentLinkErrorMessageContent(props.error, 'payByLink.details.errors.unavailable', !!props.onContactSupport));
const hasActionButtons = computed(() => props.onContactSupport || props.onDismiss || errorContent.value.refreshComponent);
</script>

<template>
    <div :class="CLASSNAMES.root">
        <div>
            <picture>
                <source data-testid="source-desktop" type="image/svg+xml" media="(min-width: 681px)" :srcset="getErrorImage()" />
                <source data-testid="source-mobile" type="image/svg+xml" media="(max-width: 680px)" :srcset="getErrorImage(true)" />
                <img :srcset="getErrorImage()" alt="" />
            </picture>
        </div>

        <BentoTypography el="div" variant="title" large>
            {{ i18n.get(errorContent.title) }}
        </BentoTypography>

        <BentoTypography variant="body">
            <template v-for="(message, index) in errorContent.message" :key="message">
                <br v-if="index > 0" />
                {{ i18n.get(message, { values: { requestId: errorContent.requestId } }) }}
            </template>
        </BentoTypography>

        <div v-if="hasActionButtons" :class="CLASSNAMES.actions">
            <BentoButton v-if="props.onDismiss" variant="secondary" @click="props.onDismiss">
                {{ i18n.get('payByLink.common.actions.goBack') }}
            </BentoButton>
            <BentoButton v-if="props.onContactSupport" @click="props.onContactSupport">
                {{ i18n.get('common.actions.contactSupport.labels.reachOut') }}
            </BentoButton>
            <BentoButton v-else-if="errorContent.refreshComponent" @click="props.onRefetch">
                {{ i18n.get('common.actions.refresh.labels.default') }}
            </BentoButton>
        </div>
    </div>
</template>
