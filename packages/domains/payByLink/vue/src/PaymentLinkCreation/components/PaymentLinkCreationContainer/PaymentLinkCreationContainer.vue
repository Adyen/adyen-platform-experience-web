<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { TranslationKey } from '@integration-components/core';
import PaymentLinkCreationForm from '../PaymentLinkCreationFormContainer/PaymentLinkCreationForm.vue';
import PaymentLinkDetails from '../../../PaymentLinkDetails/components/PaymentLinkDetails/PaymentLinkDetails.vue';
import FormSuccess from '../Form/FormSuccess/FormSuccess.vue';
import type { PaymentLinkCreationFormValues, CreatedPaymentLink, PaymentLinkCreationProps } from '../../../../../domain/src';
import styles from './PaymentLinkCreationContainer.module.scss';

type PaymentLinkCreationContainerProps = PaymentLinkCreationProps & {
    embeddedInOverview?: boolean;
    onTitleChange?: (title: TranslationKey | undefined) => void;
};

const props = defineProps<PaymentLinkCreationContainerProps>();

type CreationState = 'Creation' | 'Success' | 'Details';

const state = ref<CreationState>('Creation');
const titleKey = computed<TranslationKey | undefined>(() => {
    if (state.value === 'Success') return undefined;
    if (state.value === 'Details') return 'payByLink.details.title';
    return 'payByLink.creation.form.title';
});

watch(titleKey, title => props.onTitleChange?.(title), { immediate: true });

const paymentLinkUrl = ref('');
const paymentLinkId = ref('');

function handleCreated(data: PaymentLinkCreationFormValues & { paymentLink: CreatedPaymentLink }) {
    props.onPaymentLinkCreated?.(data);
    paymentLinkUrl.value = data.paymentLink?.url ?? '';
    paymentLinkId.value = data.paymentLink?.paymentLinkId ?? '';
    state.value = 'Success';
}

function handleShowDetails() {
    if (props.onShowDetails) {
        props.onShowDetails?.({ id: paymentLinkId.value, url: paymentLinkUrl.value });
    } else {
        state.value = 'Details';
    }
}
</script>

<template>
    <div :class="styles.root">
        <PaymentLinkCreationForm
            v-if="state === 'Creation'"
            :fields-config="props.fieldsConfig"
            :store-ids="props.storeIds"
            :on-dismiss="props.onDismiss"
            :on-contact-support="props.onContactSupport"
            :embedded-in-overview="props.embeddedInOverview"
            :on-title-change="props.onTitleChange"
            @payment-link-created="handleCreated"
        />
        <FormSuccess v-if="state === 'Success'" :payment-link-url="paymentLinkUrl" :on-show-details="handleShowDetails" />
        <PaymentLinkDetails
            v-if="state === 'Details'"
            :id="paymentLinkId"
            :on-contact-support="props.onContactSupport"
            :on-title-change="props.onTitleChange"
        />
    </div>
</template>
