<script setup lang="ts">
import { computed, defineAsyncComponent, provide, ref, watch } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { BentoAlert, BentoButton, BentoLoadingIndicator, BentoStep, BentoStepper, BentoTypography } from '@adyen/bento-vue3';
import type { PaymentLinkCreationProps, PaymentLinkSettingsItem } from '../../../../../domain/src';
import { usePaymentLinkFormData } from './usePaymentLinkFormData';
import { usePaymentLinkWizard } from './usePaymentLinkWizard';
import { useInvalidFields } from './useInvalidFields';
import { PAYMENT_LINK_WIZARD_KEY } from '../../composables/wizardContext';
import FormStepRenderer from './FormStepRenderer.vue';
import ArrowRightIcon from '@adyen/ui-assets-icons-16/vue/arrow-right';
import styles from './PaymentLinkCreationForm.module.scss';

type PaymentLinkCreationFormProps = Pick<
    PaymentLinkCreationProps,
    'fieldsConfig' | 'storeIds' | 'hideTitle' | 'onCreationDismiss' | 'onContactSupport'
> & {
    embeddedInOverview?: boolean;
};

const props = defineProps<PaymentLinkCreationFormProps>();
const emit = defineEmits<{ 'payment-link-created': [data: any] }>();

const { i18n } = useCoreContext();
const TERMS_AND_CONDITIONS_SETTINGS_ITEMS: PaymentLinkSettingsItem[] = ['termsAndConditions'];

const data = usePaymentLinkFormData(() => ({ storeIds: props.storeIds, fieldsConfig: props.fieldsConfig }));
const wizard = usePaymentLinkWizard({
    i18n,
    steps: data.formSteps,
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
        if (storeValue) data.setSelectedStore(String(storeValue));
    }
);

// Seed the form's store value when a single store is auto-selected (store step skipped).
watch(
    data.selectedStore,
    storeId => {
        if (storeId && !wizard.getValue('store')) {
            const name = data.storesSelectorItems.value.find(item => item.id === storeId)?.name ?? storeId;
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
const PaymentLinkSettingsContainer = defineAsyncComponent({
    loader: () => import('../../../PaymentLinkSettings/components/PaymentLinkSettingsContainer.vue'),
    loadingComponent: BentoLoadingIndicator,
    delay: 0,
});

const currentFormStepId = computed(() => wizard.currentStep.value?.id ?? 'store');
const showConfigurationError = computed(() => data.displayConfigurationError(currentFormStepId.value));
const accountIsMisconfigured = data.accountIsMisconfigured;
const nextButtonDisabled = computed(() => !data.termsAndConditionsProvisioned.value || accountIsMisconfigured.value || showConfigurationError.value);
const isNextStepLoading = computed(() => isSubmitting.value || data.isDataLoading.value);

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
    if (wizard.isFirstStep.value) {
        props.onCreationDismiss?.();
        return;
    }
    submitError.value = null;
    isSubmitError.value = false;
    wizard.prev();
}

function handleStepSelect(index: number) {
    if (index === wizard.currentIndex.value) return;
    submitError.value = null;
    isSubmitError.value = false;
    wizard.goToStep(index);
}

function handleSetupTermsAndConditions() {
    if (!data.selectedStore.value) return;
    selectedStoreNavigationCache.value = data.selectedStore.value;
    data.setSelectedStore('');
    showTermsAndConditions.value = true;
}

function navigateBackFromTermsAndConditions() {
    data.setSelectedStore(selectedStoreNavigationCache.value);
    showTermsAndConditions.value = false;
    selectedStoreNavigationCache.value = '';
}

async function handleSubmit() {
    if (!wizard.validateStep()) return;
    const { store, payload } = wizard.getApiPayload();
    const createPaymentLink = data.createPaymentLink;
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
    <div v-else :class="styles.root">
        <div v-if="!data.isFirstLoadDone.value" :class="styles.header">
            <BentoTypography variant="title" stronger>{{ i18n.get('payByLink.creation.form.title') }}</BentoTypography>
            <div :class="styles.skeleton">
                <div :class="[styles.skeletonItem, styles.skeletonItemLarge]" />
                <div :class="[styles.skeletonItem, styles.skeletonItemSmall]" />
                <div :class="[styles.skeletonItem, styles.skeletonItemLarge]" />
            </div>
        </div>

        <template v-else>
            <div :class="styles.header">
                <BentoTypography v-if="!props.hideTitle" variant="title" stronger>
                    {{ i18n.get('payByLink.creation.form.title') }}
                </BentoTypography>
                <BentoStepper
                    :index="wizard.currentIndex.value"
                    type="linear"
                    variant="horizontal"
                    :aria-label="data.formStepsAriaLabel.value"
                    @update:index="handleStepSelect"
                >
                    <BentoStep v-for="item in data.stepperItems.value" :key="item.id">{{ item.label }}</BentoStep>
                </BentoStepper>
            </div>

            <div :class="styles.container">
                <form @submit.prevent="handleSubmit">
                    <FormStepRenderer
                        :current-form-step="currentFormStepId"
                        :select-items="data.storesSelectorItems.value"
                        :settings-data="data.settingsData.value"
                        :stores-data="data.storesData.value"
                        :configuration-data="data.configurationData.value"
                        :countries-data="data.countriesData.value"
                        :country-dataset-data="data.countryDatasetData.value"
                        :is-fetching-countries="data.isFetchingCountries.value"
                        :is-fetching-country-dataset="data.isFetchingCountryDataset.value"
                        :terms-and-conditions-provisioned="data.termsAndConditionsProvisioned.value"
                        :can-modify-settings="data.canModifySettings.value"
                        :is-same-address="isSameAddress"
                        :on-contact-support="props.onContactSupport"
                        @update:is-same-address="(value: boolean) => (isSameAddress = value)"
                        @setup-terms-and-conditions="handleSetupTermsAndConditions"
                    />

                    <BentoAlert v-if="showConfigurationError" :class="styles.errorAlert" type="critical" role="alert">
                        {{ i18n.get('common.errors.somethingWentWrong') }}
                        <template #description>
                            <span>{{ i18n.get('payByLink.creation.errors.unavailable') }}</span>
                            <span>{{ i18n.get('common.errors.retry') }}</span>
                        </template>
                    </BentoAlert>

                    <BentoAlert v-if="accountIsMisconfigured" :class="styles.warningAlert" type="warning" role="alert">
                        {{ i18n.get('payByLink.common.errors.accountConfiguration') }}
                        <template #description>
                            <span>{{ i18n.get('common.errors.contactSupport') }}</span>
                            <BentoButton v-if="props.onContactSupport" variant="tertiary" @click="props.onContactSupport">
                                {{ i18n.get('common.actions.contactSupport.labels.reachOut') }}
                            </BentoButton>
                        </template>
                    </BentoAlert>

                    <BentoAlert v-if="isSubmitError" :class="styles.errorAlert" type="critical" role="alert">
                        {{ submitErrorTitle }}
                        <template #description>
                            <ul v-if="mappedInvalidFields.length" :class="styles.invalidFieldsError">
                                <li v-for="(message, index) in mappedInvalidFields" :key="index">{{ message }}</li>
                            </ul>
                            <BentoButton v-if="props.onContactSupport" variant="tertiary" @click="props.onContactSupport">
                                {{ i18n.get('common.actions.contactSupport.labels.reachOut') }}
                            </BentoButton>
                        </template>
                    </BentoAlert>

                    <div :class="styles.buttonsContainer">
                        <BentoButton
                            v-if="!wizard.isFirstStep.value || props.onCreationDismiss"
                            variant="secondary"
                            type="button"
                            @click="handlePrevious"
                        >
                            {{ i18n.get('payByLink.creation.form.steps.back') }}
                        </BentoButton>
                        <BentoButton
                            v-if="wizard.isLastStep.value"
                            variant="primary"
                            type="submit"
                            :disabled="nextButtonDisabled || isNextStepLoading"
                        >
                            {{ i18n.get('payByLink.creation.form.steps.submit') }}
                        </BentoButton>
                        <BentoButton
                            v-else
                            variant="primary"
                            type="button"
                            :disabled="nextButtonDisabled || isNextStepLoading"
                            :state="isNextStepLoading ? 'loading' : undefined"
                            @click="handleContinue"
                        >
                            {{ i18n.get('payByLink.creation.form.steps.continue') }}
                            <template #iconRight>
                                <ArrowRightIcon />
                            </template>
                        </BentoButton>
                    </div>
                </form>
            </div>
        </template>
    </div>
</template>
