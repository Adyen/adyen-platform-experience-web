<script setup lang="ts">
import { BentoLoadingSkeleton, BentoLoadingSkeletonShape, BentoLoadingSkeletonTypography } from '@adyen/bento-vue3';
import styles from './CashOutRequestSkeleton.module.scss';
</script>

<template>
    <BentoLoadingSkeleton :class="styles.root" aria-hidden="true">
        <div :class="styles.amount">
            <div :class="styles.field">
                <BentoLoadingSkeletonTypography :class="styles.label" :lines="1" :last-line-width="100" />
                <div :class="styles.input">
                    <BentoLoadingSkeletonShape variant="rectangle" />
                </div>
            </div>
            <div :class="styles.details">
                <div v-for="detail in 2" :key="detail" :class="styles.detail">
                    <BentoLoadingSkeletonTypography :class="styles.label" :lines="1" :last-line-width="100" />
                    <BentoLoadingSkeletonTypography :class="styles.value" :lines="1" :last-line-width="100" />
                </div>
            </div>
        </div>
        <div :class="styles.field">
            <BentoLoadingSkeletonTypography :class="styles.label" :lines="1" :last-line-width="100" />
            <div :class="styles.input">
                <BentoLoadingSkeletonShape variant="rectangle" />
            </div>
        </div>
        <div :class="styles.summary">
            <BentoLoadingSkeletonShape variant="rectangle" />
        </div>
        <div :class="styles.actions">
            <div :class="[styles.button, styles.cancelButton]">
                <BentoLoadingSkeletonShape variant="rectangle" />
            </div>
            <div :class="[styles.button, styles.submitButton]">
                <BentoLoadingSkeletonShape variant="rectangle" />
            </div>
        </div>
    </BentoLoadingSkeleton>
</template>
