<script setup lang="ts">
import { computed } from 'vue';
import { BentoLink, BentoTypography } from '@adyen/bento-vue3';
import { isCustomDataObject, isIconType, isLinkType } from './useCustomDataCells';
import styles from './CustomDetailValue.module.scss';

const props = defineProps<{
    value?: unknown;
}>();

const customData = computed(() => (isCustomDataObject(props.value) ? props.value : undefined));
const displayValue = computed(() => (customData.value ? customData.value.value : props.value));
const hasDisplayValue = computed(() => displayValue.value != null && String(displayValue.value).trim() !== '');
const link = computed(() => (isLinkType(customData.value) && customData.value.config?.href ? customData.value.config : undefined));
const icon = computed(() => (isIconType(customData.value) && customData.value.config?.src ? customData.value.config : undefined));
</script>

<template>
    <BentoLink v-if="link" :class="link.className" :to="link.href" :target="link.target || '_blank'" rel="noopener noreferrer" external>
        {{ displayValue }}
    </BentoLink>
    <div v-else-if="icon" :class="[styles.icon, icon.className]">
        <img :class="styles.iconImage" :src="icon.src" :alt="icon.alt ?? String(displayValue ?? '')" />
        <BentoTypography v-if="hasDisplayValue" variant="body">
            {{ displayValue }}
        </BentoTypography>
    </div>
    <BentoTypography v-else variant="body" :class="customData?.config?.className">
        {{ displayValue }}
    </BentoTypography>
</template>
