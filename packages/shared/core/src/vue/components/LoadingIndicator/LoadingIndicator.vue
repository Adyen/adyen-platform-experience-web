<script setup lang="ts">
import { BentoLoadingIndicator } from '@adyen/bento-vue3';
import styles from './LoadingIndicator.module.scss';
</script>

<template>
    <div :class="styles.root">
        <BentoLoadingIndicator />
    </div>
</template>
