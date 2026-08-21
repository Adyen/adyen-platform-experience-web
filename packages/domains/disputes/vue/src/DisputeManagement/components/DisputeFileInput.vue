<script setup lang="ts">
import { ref } from 'vue';
import { BentoFileUploader } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { ALLOWED_FILE_TYPES, DOCUMENT_MAX_SIZE } from '@integration-components/disputes/domain';
import { getHumanReadableFileSize } from '@integration-components/utils';
import styles from './DisputeFileInput.module.scss';

const props = defineProps<{
    disabled?: boolean;
    required?: boolean;
}>();

const emit = defineEmits<{
    change: [file: File | undefined];
}>();

const { i18n } = useCoreContext();
const modelValue = ref<File | undefined>();
const errorMessage = ref<string | undefined>();

const accept = '.pdf,.jpg,.jpeg,.tiff';

function validateFile(file: File) {
    if (!(ALLOWED_FILE_TYPES as readonly string[]).includes(file.type)) {
        return i18n.get('common.inputs.file.errors.disallowedType');
    }
    const maxSize = DOCUMENT_MAX_SIZE[file.type as keyof typeof DOCUMENT_MAX_SIZE];
    if (maxSize !== undefined && file.size > maxSize) {
        return i18n.get('disputes.management.defend.common.inputs.file.errors.tooLarge', {
            values: {
                size: getHumanReadableFileSize(maxSize),
                type: file.type.replace(/^([^/]+\/)*/gi, '').toUpperCase(),
            },
        });
    }
    return undefined;
}

function onChange(files?: FileList) {
    const file = files?.[0];
    errorMessage.value = undefined;
    if (file) {
        const validationError = validateFile(file);
        if (validationError) {
            errorMessage.value = validationError;
            modelValue.value = undefined;
            emit('change', undefined);
            return;
        }
    }
    modelValue.value = file;
    emit('change', file);
}

function onUploadError(hasError: boolean) {
    if (!hasError) return;
    modelValue.value = undefined;
    emit('change', undefined);
}
</script>

<template>
    <BentoFileUploader
        v-model="modelValue"
        :class="styles.root"
        :accept="accept"
        :disabled="props.disabled"
        :error-message="errorMessage"
        :label="i18n.get('common.inputs.file.labels.default')"
        :max-count="1"
        :required="props.required"
        @change="onChange"
        @error:upload="onUploadError"
    />
</template>
