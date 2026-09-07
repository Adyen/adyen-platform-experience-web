<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BentoAlert, BentoCheckbox, BentoInputField, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import type { IPaymentLinkTermsAndConditions } from '@integration-components/types';
import { usePaymentLinkSettingsContext } from '../composables/context';
import { isTermsAndConditionsData, isValidURL } from '@integration-components/payByLink/domain';
import Requirements from './Requirements.vue';
import styles from './TermsAndConditions.module.scss';
import layoutStyles from './PaymentLinkSettingsLayout.module.scss';

const props = defineProps<{
    data: IPaymentLinkTermsAndConditions;
    initialData: IPaymentLinkTermsAndConditions;
}>();

const { i18n } = useCoreContext();
const {
    savedData,
    setPayload,
    saveActionCalled,
    setIsValid,
    isSaving,
    isSaveSuccess,
    isSaveError,
    setSaveActionCalled,
    setIsSaveError,
    setIsSaveSuccess,
    isShowingRequirements,
    setIsShowingRequirements,
    navigateBack,
} = usePaymentLinkSettingsContext();

const termsAndConditionsURL = ref(props.data?.termsOfServiceUrl ?? '');
const isRequirementsChecked = ref<boolean | undefined>(undefined);
const showNotCheckedRequirementsError = ref(false);
const showInvalidURL = ref(false);
const isTermsAndConditionsChanged = ref(false);
const disabled = ref(false);
const requirementsOpenedOnce = ref(false);
let userRequirementsInput = false;

watch([isRequirementsChecked, termsAndConditionsURL], () => {
    setIsValid(!!isRequirementsChecked.value && isValidURL(termsAndConditionsURL.value));
});

watch(savedData, () => {
    userRequirementsInput = false;
});

watch(saveActionCalled, value => {
    if (value) {
        showInvalidURL.value = Boolean(termsAndConditionsURL.value && !isValidURL(termsAndConditionsURL.value));
        showNotCheckedRequirementsError.value = !isRequirementsChecked.value;
        setSaveActionCalled(false);
        setIsSaveSuccess(false);
        setIsSaveError(false);
    }
});

watch(
    [termsAndConditionsURL, savedData],
    () => {
        const data = isTermsAndConditionsData(savedData.value) ? savedData.value : props.initialData;
        const hasEmptyInitialValue = !data || !data.termsOfServiceUrl;
        const isSameWithInitialValue =
            !!data && (data.termsOfServiceUrl === termsAndConditionsURL.value || (!data.termsOfServiceUrl && termsAndConditionsURL.value === ''));

        if (isSameWithInitialValue) {
            if (!hasEmptyInitialValue) {
                disabled.value = true;
                isRequirementsChecked.value = true;
            }
            isTermsAndConditionsChanged.value = false;
        } else {
            disabled.value = false;
            isTermsAndConditionsChanged.value = true;
            isRequirementsChecked.value = userRequirementsInput;
        }
    },
    { immediate: true }
);

function onTermsAndConditionsURLInput(value: string) {
    showInvalidURL.value = false;
    termsAndConditionsURL.value = value;
    if (isValidURL(value)) {
        setPayload({ termsOfServiceUrl: value });
    }
}

function openRequirements() {
    setIsShowingRequirements(true);
    requirementsOpenedOnce.value = true;
}

function onCheckboxUpdate(checked: boolean) {
    if (checked) showNotCheckedRequirementsError.value = false;
    if (!userRequirementsInput && checked && !requirementsOpenedOnce.value) {
        openRequirements();
    }
    userRequirementsInput = checked;
    isRequirementsChecked.value = checked;
}

function closeModal() {
    setIsShowingRequirements(false);
}

function acceptRequirements() {
    isRequirementsChecked.value = true;
}

const checkboxLabelPrefix = computed(() =>
    i18n.get('payByLink.settings.termsAndConditions.requirement.checkbox.part1', { values: { requirements: '' } })
);

const hasValidationError = computed(() => showInvalidURL.value || showNotCheckedRequirementsError.value);
</script>

<template>
    <section :class="styles.root">
        <template v-if="!isShowingRequirements">
            <BentoAlert v-if="hasValidationError" type="critical" :dismissible="false">
                <template #description>{{ i18n.get('payByLink.settings.common.alerts.validationError') }}</template>
            </BentoAlert>
            <BentoAlert v-else-if="isSaveSuccess && !navigateBack" type="success" variant="tip" :dismissible="false">
                <template #description>{{ i18n.get('payByLink.settings.common.alerts.saveSuccess') }}</template>
            </BentoAlert>
            <BentoAlert v-else-if="isSaveError" type="critical" variant="tip" :dismissible="false">
                <template #description>{{ i18n.get('payByLink.settings.common.alerts.saveError') }}</template>
            </BentoAlert>
            <div :class="layoutStyles.contentHeader">
                <BentoTypography variant="title" medium el="div">{{ i18n.get('payByLink.settings.termsAndConditions.title') }}</BentoTypography>
                <BentoTypography variant="body" wide>{{ i18n.get('payByLink.settings.termsAndConditions.subtitle') }}</BentoTypography>
            </div>
            <div>
                <div :class="layoutStyles.inputContainer">
                    <BentoInputField
                        :disabled="!!isSaving"
                        :readonly="!!isSaving"
                        :lang="i18n.locale"
                        :label="i18n.get('payByLink.settings.termsAndConditions.urlInput.label')"
                        :value="termsAndConditionsURL"
                        :max-length="2000"
                        :error-message="showInvalidURL ? i18n.get('payByLink.settings.termsAndConditions.error.urlValidation') : undefined"
                        @input="onTermsAndConditionsURLInput"
                    />
                </div>
                <BentoAlert v-if="isTermsAndConditionsChanged" type="warning" variant="tip" role="alert" :class="styles.alert">
                    <template #description>{{ i18n.get('payByLink.settings.termsAndConditions.alert.urlChange') }}</template>
                </BentoAlert>
                <div :class="styles.checkboxContainer">
                    <BentoCheckbox
                        :model-value="isRequirementsChecked ?? false"
                        :disabled="disabled || !!isSaving"
                        required
                        :error-message="
                            showNotCheckedRequirementsError
                                ? i18n.get('payByLink.settings.termsAndConditions.error.requirementsNotChecked')
                                : undefined
                        "
                        :class="styles.checkbox"
                        @update:model-value="onCheckboxUpdate"
                    >
                        {{ checkboxLabelPrefix }}
                        <button type="button" :class="styles.requirementsLink" @click.stop="openRequirements">
                            {{ i18n.get('payByLink.settings.termsAndConditions.requirement.checkbox.part2') }}
                        </button>
                    </BentoCheckbox>
                </div>
            </div>
        </template>
        <Requirements
            v-if="isShowingRequirements"
            :terms-and-conditions-url="termsAndConditionsURL"
            @go-back="closeModal"
            @accept-requirements="acceptRequirements"
        />
    </section>
</template>
