<script setup lang="ts">
const props = defineProps<{
    labelKey?: string;
    isSkeletonVisible?: boolean;
    i18n: { get: (key: string) => string };
}>();

const BASE_CLASS = 'adyen-pe-summary-item';
</script>

<template>
    <span v-if="props.isSkeletonVisible" :class="`${BASE_CLASS}__label ${BASE_CLASS}__label--skeleton`" />
    <span v-else-if="props.labelKey" :class="`${BASE_CLASS}__label`">
        {{ props.i18n.get(props.labelKey) }}
    </span>
</template>
