<script setup lang="ts">
import { computed, ref } from 'vue';
import { BentoAlert, BentoButtonActions, BentoTypography, type BentoButtonActionsList } from '@adyen/bento-vue3';
import { useConfigContext, useCoreContext } from '@integration-components/core/vue';
import { isFunction } from '@integration-components/utils';
import type { IPaymentLinkDetails } from '@integration-components/types';
import styles from './PaymentLinkExpiration.module.scss';

const props = defineProps<{
    paymentLink: IPaymentLinkDetails;
    onCancel: () => void;
    onExpirationSuccess: () => void;
}>();

const { i18n } = useCoreContext();
const config = useConfigContext();

const isLoading = ref(false);
const hasError = ref(false);

async function handleConfirmExpire() {
    const fn = config.endpoints.expirePayByLinkPaymentLink;
    if (!isFunction(fn) || isLoading.value) return;

    isLoading.value = true;
    hasError.value = false;
    try {
        await fn({}, { path: { paymentLinkId: props.paymentLink.linkInformation.paymentLinkId } });
        props.onExpirationSuccess();
    } catch {
        hasError.value = true;
    } finally {
        isLoading.value = false;
    }
}

const actionButtons = computed<BentoButtonActionsList>(() => [
    {
        title: i18n.get('payByLink.details.expiration.actions.confirmExpiration'),
        event: handleConfirmExpire,
        variant: 'primary',
        disabled: isLoading.value,
        state: isLoading.value ? 'loading' : undefined,
    },
    {
        title: i18n.get('payByLink.details.expiration.actions.goBack'),
        event: () => props.onCancel(),
        variant: 'secondary',
        disabled: isLoading.value,
    },
]);
</script>

<template>
    <div :class="styles.root">
        <BentoTypography el="h2" variant="subtitle" stronger>
            {{ i18n.get('payByLink.details.expiration.title') }}
        </BentoTypography>

        <BentoTypography variant="body">{{ i18n.get('payByLink.details.expiration.description') }}</BentoTypography>

        <BentoAlert v-if="hasError" type="critical" role="alert">
            {{ i18n.get('payByLink.details.expiration.errorTitle') }}
            <template #description>
                {{ i18n.get('payByLink.details.expiration.errorDescription') }}
            </template>
        </BentoAlert>

        <BentoButtonActions :actions="actionButtons" />
    </div>
</template>
