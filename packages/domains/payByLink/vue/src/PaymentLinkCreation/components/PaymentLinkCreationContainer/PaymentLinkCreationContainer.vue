<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BentoTypography } from '@adyen/bento-vue3';
import type { TranslationKey } from '@integration-components/core';
import { useCoreContext, useModalContext } from '@integration-components/core/vue';
import { ComponentShell, useShouldHideTitles, type ComponentShellState } from '@integration-components/composables-vue';
import PaymentLinkCreationForm from '../PaymentLinkCreationFormContainer/PaymentLinkCreationForm.vue';
import PaymentLinkCreationFormSkeleton from '../PaymentLinkCreationFormContainer/PaymentLinkCreationFormSkeleton.vue';
import { usePaymentLinkFormData } from '../PaymentLinkCreationFormContainer/usePaymentLinkFormData';
import PaymentLinkDetails from '../../../PaymentLinkDetails/components/PaymentLinkDetails/PaymentLinkDetails.vue';
import FormSuccess from '../Form/FormSuccess/FormSuccess.vue';
import type { PaymentLinkCreationFormValues, CreatedPaymentLink } from '../../../../../domain/src';
import type { PaymentLinkCreationComponentProps } from '../../types';
import styles from './PaymentLinkCreationContainer.module.scss';

const props = defineProps<
    PaymentLinkCreationComponentProps & {
        onTitleChange?: (title: TranslationKey | undefined) => void;
    }
>();

const { i18n } = useCoreContext();
const { withinModal } = useModalContext();
const hideTitles = useShouldHideTitles();
const formData = usePaymentLinkFormData(() => ({ storeIds: props.storeIds, fieldsConfig: props.fieldsConfig }));
const initialSkeletonStep = computed(() =>
    formData.storesSelectorItems.value.length === 1 || typeof props.storeIds === 'string' || props.storeIds?.length === 1 ? 'payment' : 'store'
);
const shellState = ref<ComponentShellState>('loading');

// Only gate the first load; later requests must not reset the wizard.
watch(
    formData.isFirstLoadDone,
    isReady => {
        if (isReady) shellState.value = 'ready';
    },
    { immediate: true }
);

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
    props.onCreate?.(data);
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
    <ComponentShell :state="shellState">
        <div :class="styles.root">
            <PaymentLinkCreationForm
                v-if="state === 'Creation'"
                :form-data="formData"
                :fields-config="props.fieldsConfig"
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
        <template #loading>
            <div :class="styles.loading">
                <BentoTypography v-if="!withinModal && !hideTitles" variant="title" stronger>
                    {{ i18n.get('payByLink.creation.form.title') }}
                </BentoTypography>
                <PaymentLinkCreationFormSkeleton
                    :step="initialSkeletonStep"
                    :step-count="initialSkeletonStep === 'payment' ? 3 : 4"
                    show-navigation
                />
            </div>
        </template>
    </ComponentShell>
</template>
