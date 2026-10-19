<script setup lang="ts">
import { BentoLoadingSkeletonShape, BentoLoadingSkeletonTypography } from '@adyen/bento-vue3';
import styles from './OfferSelectionLoadingSkeleton.module.scss';
</script>

<template>
    <div :class="styles.root">
        <div :class="styles.header">
            <BentoLoadingSkeletonTypography text-style="title-l" :lines="1" :last-line-width="50" />
            <BentoLoadingSkeletonTypography :lines="1" :last-line-width="70" />
        </div>
        <BentoLoadingSkeletonTypography text-style="title-l" :lines="1" :last-line-width="20" />
        <BentoLoadingSkeletonShape variant="rectangle" height="76px" />
        <BentoLoadingSkeletonTypography :lines="1" :last-line-width="40" />
        <BentoLoadingSkeletonShape variant="rectangle" height="84px" />
        <BentoLoadingSkeletonShape variant="rectangle" height="208px" />
        <BentoLoadingSkeletonShape variant="rectangle" height="36px" />
    </div>
</template>
