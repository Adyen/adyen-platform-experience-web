<script setup lang="ts">
import { ref, watch } from 'vue';
import { BentoAlert, BentoInputField, BentoTypography } from '@adyen/bento-vue3';
import { usePayByLinkContext } from '../../integration/context';
import { usePaymentLinkSettingsContext } from '../composables/context';
import { cloneFormData } from '../utils/getThemePayload';
import { logoOptionsList, ThemeFormDataRequest } from '../constants';
import type { LogoType, ThemeFormData } from '../types';
import LogoInput from './LogoInput.vue';
import LogoPreview from './LogoPreview.vue';
import styles from './ThemeForm.module.scss';
import layoutStyles from './PaymentLinkSettingsLayout.module.scss';

const props = defineProps<{ theme: ThemeFormData }>();

const { i18n } = usePayByLinkContext();
const {
    setPayload,
    saveActionCalled,
    setSaveActionCalled,
    setIsValid,
    isSaving,
    isSaveSuccess,
    isSaveError,
    setIsSaveSuccess,
    setIsSaveError,
    navigateBack,
} = usePaymentLinkSettingsContext();

const brandName = ref(props.theme.brandName ?? '');
const logoUrl = ref<string | null>(props.theme.logo ?? null);
const fullWidthLogoUrl = ref<string | null>(props.theme.fullWidthLogo ?? null);
const touchedLogo = ref(false);
const touchedFullWidthLogo = ref(false);
const showMissingBrandName = ref(false);

function buildInitialPayload(): FormData {
    const formData = new FormData();
    if (props.theme.brandName) formData.set(ThemeFormDataRequest.BRAND, props.theme.brandName);
    if (props.theme.logo) formData.set(ThemeFormDataRequest.LOGO, props.theme.logo);
    if (props.theme.fullWidthLogo) formData.set(ThemeFormDataRequest.FULL_WIDTH_LOGO, props.theme.fullWidthLogo);
    return cloneFormData(formData);
}

let themePayload: FormData = buildInitialPayload();
setPayload(themePayload);
setIsValid(!!brandName.value);

watch(brandName, value => setIsValid(!!value));

watch(saveActionCalled, value => {
    if (value) {
        if (!brandName.value) showMissingBrandName.value = true;
        setSaveActionCalled(false);
        setIsSaveSuccess(false);
        setIsSaveError(false);
    }
});

function addFileToThemePayload(field: string, file: File) {
    const nextFormData = cloneFormData(themePayload);
    nextFormData.set(field, file, file.name);
    themePayload = nextFormData;
    setPayload(nextFormData);
}

function removeFieldFromThemePayload(field: string) {
    if (themePayload.has(field)) {
        const nextFormData = cloneFormData(themePayload);
        nextFormData.delete(field);
        themePayload = nextFormData;
        setPayload(nextFormData);
    }
}

function onBrandNameChange(value: string) {
    showMissingBrandName.value = false;
    brandName.value = value;
    const nextFormData = cloneFormData(themePayload);
    nextFormData.set(ThemeFormDataRequest.BRAND, value);
    themePayload = nextFormData;
    setPayload(nextFormData);
}

function logoPreview(type: LogoType, file: File) {
    const reader = new FileReader();
    reader.onload = e => {
        const result = e.target?.result as string;
        if (type === 'logo') logoUrl.value = result;
        if (type === 'fullWidthLogo') fullWidthLogoUrl.value = result;
    };
    reader.readAsDataURL(file);
}

function setTouched(type: LogoType) {
    if (type === 'logo') touchedLogo.value = true;
    if (type === 'fullWidthLogo') touchedFullWidthLogo.value = true;
}

function isTouched(type: LogoType) {
    return type === 'logo' ? touchedLogo.value : touchedFullWidthLogo.value;
}

function onLogoChange(type: LogoType, file: File) {
    setTouched(type);
    addFileToThemePayload(type, file);
    logoPreview(type, file);
}

function onRemoveLogoUrl(type: LogoType) {
    setTouched(type);
    removeFieldFromThemePayload(type);
    if (type === 'logo') logoUrl.value = null;
    if (type === 'fullWidthLogo') fullWidthLogoUrl.value = null;
}

function getLogoUrl(type: LogoType) {
    return type === 'logo' ? logoUrl.value : fullWidthLogoUrl.value;
}
</script>

<template>
    <div :class="styles.container">
        <BentoAlert v-if="showMissingBrandName" type="critical" :dismissible="false">
            <template #description>{{ i18n.get('payByLink.settings.common.alerts.validationError') }}</template>
        </BentoAlert>
        <BentoAlert v-else-if="isSaveSuccess && !navigateBack" type="success" variant="tip" :dismissible="false">
            <template #description>{{ i18n.get('payByLink.settings.common.alerts.saveSuccess') }}</template>
        </BentoAlert>
        <BentoAlert v-else-if="isSaveError" type="critical" variant="tip" :dismissible="false">
            <template #description>{{ i18n.get('payByLink.settings.common.alerts.saveError') }}</template>
        </BentoAlert>
        <div :class="layoutStyles.contentHeader">
            <BentoTypography variant="title" medium el="div">{{ i18n.get('payByLink.settings.theme.title') }}</BentoTypography>
            <BentoTypography variant="body" wide>{{ i18n.get('payByLink.settings.theme.subtitle') }}</BentoTypography>
        </div>
        <div :class="styles.root">
            <div :class="layoutStyles.inputContainer">
                <BentoInputField
                    type="text"
                    :disabled="!!isSaving"
                    :readonly="!!isSaving"
                    :lang="i18n.locale"
                    :label="i18n.get('payByLink.settings.theme.brandName.input.label')"
                    :value="brandName"
                    :placeholder="i18n.get('payByLink.settings.theme.brandName.input.placeholder')"
                    :error-message="showMissingBrandName ? i18n.get('payByLink.settings.theme.inputs.brandName.errors.missing') : undefined"
                    @input="onBrandNameChange"
                />
            </div>
            <div v-for="logoType in logoOptionsList" :key="logoType" :class="layoutStyles.inputContainer">
                <LogoPreview
                    v-if="getLogoUrl(logoType) && !isTouched(logoType)"
                    :disabled="!!isSaving"
                    :logo-type="logoType"
                    :logo-url="getLogoUrl(logoType)!"
                    @remove-logo="onRemoveLogoUrl"
                />
                <LogoInput
                    v-else
                    :disabled="!!isSaving"
                    :logo-type="logoType"
                    :preview-url="isTouched(logoType) ? getLogoUrl(logoType) : null"
                    @file-input-change="onLogoChange"
                    @file-removed="onRemoveLogoUrl"
                />
            </div>
        </div>
    </div>
</template>
