<script setup lang="ts">
import { computed, defineAsyncComponent, provide, ref, watch } from 'vue';
import { useCoreContext, useModalContext } from '@integration-components/core/vue';
import type { TranslationKey } from '@integration-components/core';
import {
    BentoAlert,
    BentoButton,
    BentoButtonActions,
    BentoFormLayout,
    BentoStep,
    BentoStepper,
    BentoTypography,
    type BentoButtonActionsList,
} from '@adyen/bento-vue3';
import { useShouldHideTitles } from '@integration-components/composables-vue';
import type { PaymentLinkSettingsItem } from '../../../../../domain/src';
import type { PaymentLinkCreationComponentProps } from '../../types';
import type { usePaymentLinkFormData } from './usePaymentLinkFormData';
import { usePaymentLinkWizard } from './usePaymentLinkWizard';
import { useInvalidFields } from './useInvalidFields';
import { PAYMENT_LINK_WIZARD_KEY } from '../../composables/wizardContext';
import FormStepRenderer from './FormStepRenderer.vue';
import PaymentLinkCreationFormSkeleton from './PaymentLinkCreationFormSkeleton.vue';
import ArrowRightIcon from '@adyen/ui-assets-icons-16/vue/arrow-right';
import styles from './PaymentLinkCreationForm.module.scss';

type PaymentLinkCreationFormProps = Pick<PaymentLinkCreationComponentProps, 'fieldsConfig' | 'storeIds' | 'onContactSupport'> & {
    formData: ReturnType<typeof usePaymentLinkFormData>;
    embeddedInOverview?: boolean;
    onTitleChange?: (title: TranslationKey | undefined) => void;
};

const props = defineProps<PaymentLinkCreationFormProps>();
const emit = defineEmits<{ 'payment-link-created': [data: any] }>();

const { i18n } = useCoreContext();
const { withinModal } = useModalContext();
const hideTitles = useShouldHideTitles();
const TERMS_AND_CONDITIONS_SETTINGS_ITEMS: PaymentLinkSettingsItem[] = ['termsAndConditions'];

const formData = props.formData;
const wizard = usePaymentLinkWizard({
    i18n,
    steps: formData.formSteps,
    defaults: () => props.fieldsConfig?.data,
});
const { getMappedInvalidFields } = useInvalidFields();

provide(PAYMENT_LINK_WIZARD_KEY, {
    i18n,
    values: wizard.values,
    errors: wizard.errors,
    displayValues: wizard.displayValues,
    steps: wizard.steps,
    fieldConfig: wizard.fieldConfig,
    getFieldConfig: wizard.getFieldConfig,
    getValue: wizard.getValue,
    setValue: wizard.setValue,
    getError: wizard.getError,
    validateField: wizard.validateField,
});

// Drive configuration/settings fetching from the selected store value.
watch(
    () => wizard.getValue('store'),
    storeValue => {
        if (storeValue) formData.setSelectedStore(String(storeValue));
    }
);

// Seed the form's store value when a single store is auto-selected (store step skipped).
watch(
    formData.selectedStore,
    storeId => {
        if (storeId && !wizard.getValue('store')) {
            const name = formData.storesSelectorItems.value.find(item => item.id === storeId)?.name ?? storeId;
            wizard.setValue('store', storeId, name);
        }
    },
    { immediate: true }
);

const isSameAddress = ref(!(props.fieldsConfig?.data?.billingAddress || props.fieldsConfig?.data?.deliveryAddress));
const isSubmitting = ref(false);
const submitError = ref<any>(null);
const isSubmitError = ref(false);
const selectedStoreNavigationCache = ref('');
const showTermsAndConditions = ref(false);
const titleKey = computed<TranslationKey>(() => (showTermsAndConditions.value ? 'payByLink.settings.title' : 'payByLink.creation.form.title'));

watch(titleKey, title => props.onTitleChange?.(title), { immediate: true });

const PaymentLinkSettingsContainer = defineAsyncComponent({
    loader: () => import('../../../PaymentLinkSettings/components/PaymentLinkSettingsContainer.vue'),
    loadingComponent: PaymentLinkCreationFormSkeleton,
    delay: 0,
});

const currentFormStepId = computed(() => wizard.currentStep.value?.id ?? 'store');
const showConfigurationError = computed(() => formData.displayConfigurationError(currentFormStepId.value));
const accountIsMisconfigured = formData.accountIsMisconfigured;
const nextButtonDisabled = computed(
    () => !formData.termsAndConditionsProvisioned.value || accountIsMisconfigured.value || showConfigurationError.value
);
const isNextStepLoading = computed(() => isSubmitting.value || formData.isDataLoading.value);
const showStepSkeleton = computed(() => isNextStepLoading.value && currentFormStepId.value !== 'store');

const submitErrorTitle = computed(() =>
    getMappedInvalidFields(submitError.value).length
        ? i18n.get('payByLink.creation.form.alert.invalidFields')
        : i18n.get('payByLink.creation.form.alert.somethingWentWrong')
);
const mappedInvalidFields = computed(() => getMappedInvalidFields(submitError.value));

function handleContinue() {
    if (wizard.validateStep()) wizard.next();
}

function handlePrevious() {
    if (wizard.isFirstStep.value) return;
    submitError.value = null;
    isSubmitError.value = false;
    wizard.prev();
}

function handleStepSelect(index: number) {
    if (isNextStepLoading.value || index === wizard.currentIndex.value) return;
    submitError.value = null;
    isSubmitError.value = false;
    wizard.goToStep(index);
}

function handleSetupTermsAndConditions() {
    if (!formData.selectedStore.value) return;
    selectedStoreNavigationCache.value = formData.selectedStore.value;
    formData.setSelectedStore('');
    showTermsAndConditions.value = true;
}

function navigateBackFromTermsAndConditions() {
    formData.setSelectedStore(selectedStoreNavigationCache.value);
    showTermsAndConditions.value = false;
    selectedStoreNavigationCache.value = '';
}

async function handleSubmit() {
    if (nextButtonDisabled.value || isNextStepLoading.value || !wizard.validateStep()) return;
    const { store, payload } = wizard.getApiPayload();
    const createPaymentLink = formData.createPaymentLink;
    if (typeof createPaymentLink !== 'function') return;

    isSubmitting.value = true;
    isSubmitError.value = false;
    submitError.value = null;
    try {
        const result = await createPaymentLink({ body: payload, contentType: 'application/json' }, { path: { storeId: store } });
        emit('payment-link-created', { ...payload, store, paymentLink: result });
    } catch (error) {
        submitError.value = error;
        isSubmitError.value = true;
    } finally {
        isSubmitting.value = false;
    }
}

const buttonActions = computed<BentoButtonActionsList>(() => {
    const actions: BentoButtonActionsList = [
        {
            title: wizard.isLastStep.value ? i18n.get('payByLink.creation.form.steps.submit') : i18n.get('payByLink.creation.form.steps.continue'),
            disabled: nextButtonDisabled.value || isNextStepLoading.value,
            event: wizard.isLastStep.value ? handleSubmit : handleContinue,
            variant: 'primary',
            iconRight: wizard.isLastStep.value ? undefined : ArrowRightIcon,
        },
    ];

    if (!wizard.isFirstStep.value) {
        actions.push({
            title: i18n.get('payByLink.creation.form.steps.back'),
            disabled: isSubmitting.value,
            event: handlePrevious,
            variant: 'secondary',
        });
    }

    return actions;
});
</script>

<template>
    <PaymentLinkSettingsContainer
        v-if="showTermsAndConditions"
        hide-title
        :store-ids="selectedStoreNavigationCache"
        :settings-items="TERMS_AND_CONDITIONS_SETTINGS_ITEMS"
        :navigate-back="navigateBackFromTermsAndConditions"
        :embedded-in-overview="props.embeddedInOverview"
    />
    <div v-else :class="styles.root" :aria-busy="isNextStepLoading">
        <div :class="styles.header">
            <BentoTypography v-if="!withinModal && !hideTitles" variant="title" stronger>
                {{ i18n.get('payByLink.creation.form.title') }}
            </BentoTypography>
            <BentoStepper
                :index="wizard.currentIndex.value"
                type="linear"
                variant="horizontal"
                :aria-label="formData.formStepsAriaLabel.value"
                @update:index="handleStepSelect"
            >
                <BentoStep v-for="item in formData.stepperItems.value" :key="item.id">
                    {{ item.label }}
                </BentoStep>
            </BentoStepper>
        </div>

        <BentoFormLayout form @submit.prevent="handleSubmit">
            <template v-if="isSubmitError" #error-message>
                {{ submitErrorTitle }}
                <ul v-if="mappedInvalidFields.length" :class="styles.invalidFieldsError">
                    <li v-for="(message, index) in mappedInvalidFields" :key="index">
                        {{ message }}
                    </li>
                </ul>
                <BentoButton v-if="props.onContactSupport" variant="tertiary" @click="props.onContactSupport">
                    {{ i18n.get('payByLink.common.actions.contactSupport.labels.reachOut') }}
                </BentoButton>
            </template>

            <PaymentLinkCreationFormSkeleton v-if="showStepSkeleton" :step="currentFormStepId" />
            <div v-show="!showStepSkeleton" :class="styles.container">
                <FormStepRenderer
                    :current-form-step="currentFormStepId"
                    :select-items="formData.storesSelectorItems.value"
                    :settings-data="formData.settingsData.value"
                    :stores-data="formData.storesData.value"
                    :configuration-data="formData.configurationData.value"
                    :countries-data="formData.countriesData.value"
                    :country-dataset-data="formData.countryDatasetData.value"
                    :is-fetching-countries="formData.isFetchingCountries.value"
                    :is-fetching-country-dataset="formData.isFetchingCountryDataset.value"
                    :terms-and-conditions-provisioned="formData.termsAndConditionsProvisioned.value"
                    :can-modify-settings="formData.canModifySettings.value"
                    :is-same-address="isSameAddress"
                    :on-contact-support="props.onContactSupport"
                    @update:is-same-address="(value: boolean) => (isSameAddress = value)"
                    @setup-terms-and-conditions="handleSetupTermsAndConditions"
                />

                <BentoAlert v-if="showConfigurationError" :class="styles.errorAlert" type="critical" role="alert">
                    {{ i18n.get('payByLink.common.errors.somethingWentWrong') }}
                    <template #description>
                        <span>{{ i18n.get('payByLink.creation.errors.unavailable') }}</span>
                        <span>{{ i18n.get('payByLink.common.errors.retry') }}</span>
                    </template>
                </BentoAlert>

                <BentoAlert v-if="accountIsMisconfigured" :class="styles.warningAlert" type="warning" role="alert">
                    {{ i18n.get('payByLink.common.errors.accountConfiguration') }}
                    <template #description>
                        <span>{{ i18n.get('payByLink.common.errors.contactSupport') }}</span>
                        <BentoButton v-if="props.onContactSupport" variant="tertiary" @click="props.onContactSupport">
                            {{ i18n.get('payByLink.common.actions.contactSupport.labels.reachOut') }}
                        </BentoButton>
                    </template>
                </BentoAlert>
            </div>

            <BentoButtonActions :actions="buttonActions" layout="buttons-end" />
        </BentoFormLayout>
    </div>
</template>
