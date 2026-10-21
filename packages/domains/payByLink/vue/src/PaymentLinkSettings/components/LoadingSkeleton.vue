<script setup lang="ts">
import { BentoLoadingSkeleton, BentoLoadingSkeletonShape, BentoLoadingSkeletonTypography } from '@adyen/bento-vue3';
import styles from './LoadingSkeleton.module.scss';

const props = defineProps<{
    rowNumber: number;
}>();
</script>

<template>
    <BentoLoadingSkeleton :class="styles.root" aria-busy="true" data-testid="payment-link-settings-skeleton">
        <div :class="styles.header">
            <div :class="styles.title">
                <BentoLoadingSkeletonTypography text-style="title-m" :lines="1" :last-line-width="100" />
            </div>
            <div :class="styles.subtitle">
                <BentoLoadingSkeletonTypography text-style="body-wide" :lines="1" :last-line-width="100" />
            </div>
        </div>
        <div v-for="row in props.rowNumber" :key="row" :class="styles.field" data-testid="settings-skeleton-field">
            <div :class="styles.label">
                <BentoLoadingSkeletonTypography text-style="body" :lines="1" :last-line-width="100" />
            </div>
            <div :class="styles.control">
                <BentoLoadingSkeletonShape variant="rectangle" />
            </div>
        </div>
    </BentoLoadingSkeleton>
</template>
