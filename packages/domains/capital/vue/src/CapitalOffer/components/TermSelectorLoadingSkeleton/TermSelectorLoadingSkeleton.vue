<script setup lang="ts">
import { BentoLoadingSkeletonShape, BentoLoadingSkeletonTypography } from '@adyen/bento-vue3';
import styles from './TermSelectorLoadingSkeleton.module.scss';
</script>

<template>
    <div :class="styles.root">
        <BentoLoadingSkeletonTypography :lines="1" :last-line-width="30" />
        <BentoLoadingSkeletonShape variant="rectangle" height="84px" width="100%" />
    </div>
</template>
