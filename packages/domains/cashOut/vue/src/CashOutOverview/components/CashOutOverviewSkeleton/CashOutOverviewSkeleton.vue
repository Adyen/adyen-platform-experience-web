<script setup lang="ts">
import { BentoLoadingSkeleton, BentoLoadingSkeletonShape, BentoLoadingSkeletonTypography } from '@adyen/bento-vue3';
import styles from './CashOutOverviewSkeleton.module.scss';
</script>

<template>
    <BentoLoadingSkeleton :class="styles.root" aria-hidden="true">
        <BentoLoadingSkeletonTypography :class="styles.amount" :lines="1" :last-line-width="100" text-style="title-l" />
        <div :class="styles.startButton">
            <BentoLoadingSkeletonShape variant="rectangle" />
        </div>
    </BentoLoadingSkeleton>
</template>
