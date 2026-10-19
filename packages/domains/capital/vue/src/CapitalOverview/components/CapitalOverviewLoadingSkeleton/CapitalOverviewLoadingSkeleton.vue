<script setup lang="ts">
import { BentoLoadingSkeletonShape, BentoLoadingSkeletonTypography } from '@adyen/bento-vue3';
import styles from './CapitalOverviewLoadingSkeleton.module.scss';
</script>

<template>
    <div :class="styles.root">
        <div :class="styles.header">
            <BentoLoadingSkeletonTypography text-style="title-l" :lines="1" :last-line-width="40" />
            <BentoLoadingSkeletonTypography :lines="1" :last-line-width="70" />
        </div>
        <BentoLoadingSkeletonShape variant="rectangle" height="152px" />
    </div>
</template>
