<script setup lang="ts">
import { computed } from 'vue';
import { BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { getHumanReadableFileSize } from '@integration-components/utils';
import { getHumanReadableFileName } from '@integration-components/utils/file/naming';
import { LOGO_DIMENSIONS, THEME_FORM_ALLOWED_FILE_TYPES, THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE } from '../constants';
import type { LogoType } from '../types';
import styles from './ThemeForm.module.scss';

const props = defineProps<{ logoType: LogoType }>();

const { i18n } = useCoreContext();

const allowedFileTypesText = THEME_FORM_ALLOWED_FILE_TYPES.map(type => getHumanReadableFileName(type)).join(', ');
const maxSizeText = getHumanReadableFileSize(THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE);
const imageSizeText = computed(() => {
    const dimensions = LOGO_DIMENSIONS[props.logoType];
    return `${dimensions.width} x ${dimensions.height} px`;
});
</script>

<template>
    <div :class="styles.fileInfoContainer">
        <BentoTypography variant="body" :class="styles.fileInfo">
            {{ i18n.get('payByLink.settings.theme.limitations.file.input.supportedFile.text') }}{{ allowedFileTypesText }}
        </BentoTypography>
        <BentoTypography variant="body" :class="styles.fileInfo">
            {{ i18n.get('payByLink.settings.theme.limitations.file.input.maxSize.text') }}{{ maxSizeText }}
        </BentoTypography>
        <BentoTypography variant="body" :class="styles.fileInfo">
            {{ i18n.get('payByLink.settings.theme.limitations.file.input.imageSize.text') }}{{ imageSizeText }}
        </BentoTypography>
    </div>
</template>
