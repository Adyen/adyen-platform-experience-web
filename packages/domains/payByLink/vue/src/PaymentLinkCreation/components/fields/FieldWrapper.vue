<script setup lang="ts">
import styles from './FieldWrapper.module.scss';

defineProps<{
    name: string;
    error?: string;
}>();
</script>

<template>
    <div :class="styles.root" :data-testid="`form-field-${name}`">
        <slot />
        <div v-if="error" :class="styles.error" :data-testid="`field-error-${name}`">
            {{ error }}
        </div>
    </div>
</template>
