<script setup lang="ts">
import { ref } from 'vue';
import PaymentLinkCreationForm from '../PaymentLinkCreationFormContainer/PaymentLinkCreationForm.vue';
import PaymentLinkDetails from '../../../PaymentLinkDetails/components/PaymentLinkDetails/PaymentLinkDetails.vue';
import FormSuccess from '../Form/FormSuccess/FormSuccess.vue';
import type { PaymentLinkCreationFormValues, CreatedPaymentLink, PaymentLinkCreationProps } from '../../../../../domain/src';
import '@adyen/bento-vue3/styles/bento-light';
import styles from './PaymentLinkCreationContainer.module.scss';

type PaymentLinkCreationContainerProps = PaymentLinkCreationProps & {
    embeddedInOverview?: boolean;
};

const props = defineProps<PaymentLinkCreationContainerProps>();

type CreationState = 'Creation' | 'Success' | 'Details';

const state = ref<CreationState>('Creation');
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
            :hide-title="props.hideTitle"
            :on-creation-dismiss="props.onCreationDismiss"
            :on-contact-support="props.onContactSupport"
            :embedded-in-overview="props.embeddedInOverview"
            @payment-link-created="handleCreated"
        />
        <FormSuccess v-if="state === 'Success'" :payment-link-url="paymentLinkUrl" :on-show-details="handleShowDetails" />
        <PaymentLinkDetails v-if="state === 'Details'" :id="paymentLinkId" />
    </div>
</template>
