<script setup lang="ts">
import './FieldWrapper.scss';

defineProps<{
    name: string;
    error?: string;
}>();
</script>

<template>
    <div class="adyen-pe-payment-link-creation-form__field" :data-testid="`form-field-${name}`">
        <slot />
        <div v-if="error" class="adyen-pe-payment-link-creation-form__field-error" :data-testid="`field-error-${name}`">
            {{ error }}
        </div>
    </div>
</template>
