<script setup lang="ts">
const props = defineProps<{
    isLoading?: boolean;
    hasMargin?: boolean;
    width?: string;
}>();

const BASE_CLASS = 'adyen-pe-amount-skeleton';
</script>

<template>
    <span
        :class="[
            BASE_CLASS,
            { [`${BASE_CLASS}--loading`]: props.isLoading },
            { [`${BASE_CLASS}--margin`]: props.hasMargin },
        ]"
        :style="{ width: props.width }"
    />
</template>
