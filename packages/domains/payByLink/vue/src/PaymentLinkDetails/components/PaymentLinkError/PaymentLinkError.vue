<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert, BentoButton, BentoTypography } from '@adyen/bento-vue3';
import { getPaymentLinkErrorMessageContent } from '../../utils/getPaymentLinkErrorMessageContent';
import type { PaymentLinkDetailsError } from '../../composables/usePaymentLinkDetails';
import { usePayByLinkContext } from '../../../integration/context';

const props = defineProps<{
    error?: PaymentLinkDetailsError;
    onContactSupport?: () => void;
    onDismiss?: () => void;
    onRefresh: () => void;
}>();

const { i18n } = usePayByLinkContext();

const errorContent = computed(() => getPaymentLinkErrorMessageContent(props.error, 'payByLink.details.errors.unavailable', !!props.onContactSupport));
const showContactSupport = computed(() => props.error?.errorCode === '500' && !!props.onContactSupport);
</script>

<template>
    <BentoAlert type="critical" role="alert">
        <BentoTypography variant="title">{{ i18n.get(errorContent.title) }}</BentoTypography>
        <template #description>
            <BentoTypography v-for="message in errorContent.message" :key="message" variant="body">
                {{ i18n.get(message, errorContent.requestId ? { values: { requestId: errorContent.requestId } } : undefined) }}
            </BentoTypography>
        </template>
        <template #actions>
            <BentoButton v-if="props.onDismiss" variant="secondary" @click="props.onDismiss">
                {{ i18n.get('payByLink.common.actions.goBack') }}
            </BentoButton>
            <BentoButton v-if="showContactSupport" variant="primary" @click="props.onContactSupport">
                {{ i18n.get('payByLink.actions.contactSupport.labels.reachOut') }}
            </BentoButton>
            <BentoButton v-else-if="errorContent.refreshComponent" variant="primary" @click="props.onRefresh">
                {{ i18n.get('payByLink.actions.refresh.labels.default') }}
            </BentoButton>
        </template>
    </BentoAlert>
</template>
