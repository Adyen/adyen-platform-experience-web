<script setup lang="ts">
import { BentoButton, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { LogoLabel } from '../constants';
import type { LogoType } from '../types';
import styles from './ThemeForm.module.scss';

const props = defineProps<{
    disabled?: boolean;
    logoType: LogoType;
    logoUrl: string;
}>();

const emit = defineEmits<{
    removeLogo: [logoType: LogoType];
}>();

const { i18n } = useCoreContext();

function onRemove() {
    emit('removeLogo', props.logoType);
}
</script>

<template>
    <div :class="styles.previewContainer">
        <BentoTypography variant="body" el="span" stronger>{{ i18n.get(LogoLabel[props.logoType]) }}</BentoTypography>
        <img :src="logoUrl" :alt="i18n.get(LogoLabel[props.logoType])" :class="styles.previewImage" />
        <BentoButton :disabled="props.disabled" variant="secondary" :class="styles.previewRemove" @click="onRemove">
            {{ i18n.get('payByLink.settings.theme.action.logo.remove') }}
        </BentoButton>
    </div>
</template>
