<script setup lang="ts">
withDefaults(
    defineProps<{
        rowNumber: number;
    }>(),
    { rowNumber: 3 }
);
</script>

<template>
    <div class="adyen-pe-payment-link-settings__skeleton">
        <div class="adyen-pe-payment-link-settings__skeleton-item adyen-pe-payment-link-settings__skeleton-item--header"></div>
        <div v-for="index in rowNumber" :key="index" class="adyen-pe-payment-link-settings__skeleton-container">
            <div class="adyen-pe-payment-link-settings__skeleton-item adyen-pe-payment-link-settings__skeleton-item--small"></div>
            <div class="adyen-pe-payment-link-settings__skeleton-item adyen-pe-payment-link-settings__skeleton-item--large"></div>
        </div>
    </div>
</template>
