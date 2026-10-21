<script setup lang="ts">
import { BentoLoadingSkeleton, BentoLoadingSkeletonShape, BentoLoadingSkeletonTypography } from '@adyen/bento-vue3';
import styles from './CashOutOverviewSkeleton.module.scss';
</script>

<template>
    <BentoLoadingSkeleton :class="styles.root" aria-hidden="true">
        <div :class="styles.availableForCashOut">
            <BentoLoadingSkeletonTypography :class="styles.label" :lines="1" :last-line-width="100" />
            <BentoLoadingSkeletonTypography :class="styles.amount" :lines="1" :last-line-width="100" text-style="title-l" />
        </div>
        <div :class="styles.startButton">
            <BentoLoadingSkeletonShape variant="rectangle" />
        </div>
    </BentoLoadingSkeleton>
</template>
