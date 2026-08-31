<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BentoFileUploader } from '@adyen/bento-vue3';
import { usePayByLinkContext } from '../../integration/context';
import { LOGO_DIMENSIONS, LogoLabel, THEME_FORM_ALLOWED_FILE_TYPES, THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE } from '../constants';
import type { LogoType } from '../types';
import styles from './ThemeForm.module.scss';

const props = defineProps<{
    disabled?: boolean;
    logoType: LogoType;
    previewUrl?: string | null;
}>();

const emit = defineEmits<{
    fileInputChange: [logoType: LogoType, file: File];
    fileRemoved: [logoType: LogoType];
}>();

const { i18n } = usePayByLinkContext();
const modelValue = ref<File | undefined>();
const error = ref(false);
const cachedModelValue = ref<File | undefined>();
const maxDimensions = computed(() => LOGO_DIMENSIONS[props.logoType]);

watch(error, () => {
    if (error.value) {
        cachedModelValue.value = undefined;
    }
});

function onError(value: boolean) {
    error.value = value;
    if (!value && cachedModelValue.value) {
        modelValue.value = cachedModelValue.value;
        emit('fileInputChange', props.logoType, modelValue.value);
    }
}

function onChange(files?: FileList) {
    const file = files?.[0];
    cachedModelValue.value = file || undefined;
    if (!file) {
        emit('fileRemoved', props.logoType);
    }

    //TODO: This is old custom error handling clean onces the error handling of bento has been confirmed
    // if (!(THEME_FORM_ALLOWED_FILE_TYPES as readonly string[]).includes(file.type)) {
    //     errorMessage.value = i18n.get('payByLink.inputs.file.errors.disallowedType');
    //     modelValue.value = undefined;
    //     return;
    // }
    //
    // if (file.size > THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE) {
    //     errorMessage.value = i18n.get('payByLink.inputs.file.errors.tooLarge');
    //     modelValue.value = undefined;
    //     return;
    // }
    //
    // try {
    //     const dimensions = await getImageDimensions(file);
    //     const expected = LOGO_DIMENSIONS[props.logoType];
    //     if (dimensions.width !== expected.width || dimensions.height !== expected.height) {
    //         errorMessage.value = i18n.get(LOGO_DIMENSION_ERROR[props.logoType]);
    //         modelValue.value = undefined;
    //         return;
    //     }
    // } catch {
    //     errorMessage.value = i18n.get('payByLink.inputs.file.errors.default');
    //     modelValue.value = undefined;
    //     return;
    // }
}
</script>

<template>
    <div :class="styles.fileInput">
        <img v-if="props.previewUrl" :src="props.previewUrl" :alt="i18n.get(LogoLabel[props.logoType])" :class="styles.previewImage" />
        <BentoFileUploader
            v-model="modelValue"
            condensed
            :disabled="props.disabled"
            :label="i18n.get(LogoLabel[props.logoType])"
            :max-count="1"
            :max-dimensions="maxDimensions"
            :max-size="THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE"
            :accept="THEME_FORM_ALLOWED_FILE_TYPES.join(',')"
            optional
            @change="onChange"
            @error:upload="onError"
        />
    </div>
</template>
