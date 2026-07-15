<script setup lang="ts">
import { ref } from 'vue';
import { BentoFileUploader } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { getImageDimensions } from '../utils/getImageDimensions';
import { LOGO_DIMENSIONS, LOGO_DIMENSION_ERROR, LogoLabel, THEME_FORM_ALLOWED_FILE_TYPES, THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE } from '../constants';
import type { LogoType } from '../types';
import LogoRequirements from './LogoRequirements.vue';

const props = defineProps<{
    disabled?: boolean;
    logoType: LogoType;
    previewUrl?: string | null;
}>();

const emit = defineEmits<{
    fileInputChange: [logoType: LogoType, file: File];
    fileRemoved: [logoType: LogoType];
}>();

const { i18n } = useCoreContext();
const modelValue = ref<File | undefined>();
const errorMessage = ref<string | undefined>();

async function onChange(files?: FileList) {
    const file = files?.[0];
    errorMessage.value = undefined;

    if (!file) {
        modelValue.value = undefined;
        emit('fileRemoved', props.logoType);
        return;
    }

    try {
        const dimensions = await getImageDimensions(file);
        const expected = LOGO_DIMENSIONS[props.logoType];
        if (dimensions.width !== expected.width || dimensions.height !== expected.height) {
            errorMessage.value = i18n.get(LOGO_DIMENSION_ERROR[props.logoType]);
            modelValue.value = undefined;
            return;
        }
    } catch {
        errorMessage.value = i18n.get('common.inputs.file.errors.default');
        modelValue.value = undefined;
        return;
    }

    if (!(THEME_FORM_ALLOWED_FILE_TYPES as readonly string[]).includes(file.type)) {
        errorMessage.value = i18n.get('common.inputs.file.errors.disallowedType');
        modelValue.value = undefined;
        return;
    }

    if (file.size > THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE) {
        errorMessage.value = i18n.get('common.inputs.file.errors.tooLarge');
        modelValue.value = undefined;
        return;
    }

    modelValue.value = file;
    emit('fileInputChange', props.logoType, file);
}
</script>

<template>
    <div class="adyen-pe-payment-link-theme-form__file-input">
        <img
            v-if="props.previewUrl"
            :src="props.previewUrl"
            :alt="i18n.get(LogoLabel[props.logoType])"
            class="adyen-pe-payment-link-theme-form__preview-image"
        />
        <BentoFileUploader
            v-model="modelValue"
            :disabled="props.disabled"
            :error-message="errorMessage"
            :label="i18n.get(LogoLabel[props.logoType])"
            :max-count="1"
            :accept="THEME_FORM_ALLOWED_FILE_TYPES.join(',')"
            optional
            @change="onChange"
        />
        <LogoRequirements :logo-type="props.logoType" />
    </div>
</template>
