<script setup lang="ts">
import { computed, ref } from 'vue';
import { BentoFileUploader } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { LOGO_DIMENSIONS, logoLabel, THEME_FORM_ALLOWED_FILE_TYPES, THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE } from '../constants';
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
    validationChange: [logoType: LogoType, isValid: boolean];
}>();

const { i18n } = useCoreContext();
const modelValue = ref<FileList | undefined>();
const maxDimensions = computed(() => LOGO_DIMENSIONS[props.logoType]);

function onError(hasError: boolean) {
    emit('validationChange', props.logoType, !hasError);
    if (hasError) emit('fileRemoved', props.logoType);
}

function onChange(files?: FileList) {
    const file = files?.[0];
    emit('validationChange', props.logoType, true);
    if (file) {
        emit('fileInputChange', props.logoType, file);
    } else {
        emit('fileRemoved', props.logoType);
    }
}
</script>

<template>
    <div :class="styles.fileInput">
        <img v-if="props.previewUrl" :src="props.previewUrl" :alt="i18n.get(logoLabel[props.logoType])" :class="styles.previewImage" />
        <BentoFileUploader
            v-model="modelValue"
            condensed
            :disabled="props.disabled"
            :label="i18n.get(logoLabel[props.logoType])"
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
