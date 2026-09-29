<script setup lang="ts">
import styles from './LoadingSkeleton.module.scss';

withDefaults(
    defineProps<{
        rowNumber: number;
    }>(),
    { rowNumber: 3 }
);
</script>

<template>
    <div :class="styles.root">
        <div :class="[styles.item, styles.header]" />
        <div v-for="index in rowNumber" :key="index" :class="styles.container">
            <div :class="[styles.item, styles.small]" />
            <div :class="[styles.item, styles.large]" />
        </div>
    </div>
</template>
