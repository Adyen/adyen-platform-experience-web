<script setup lang="ts">
import styles from './FieldWrapper.module.scss';

defineProps<{
    name: string;
}>();
</script>

<template>
    <div :class="styles.root" :data-testid="`form-field-${name}`">
        <slot />
    </div>
</template>
