<script setup lang="ts">
import { BentoCard, BentoLoadingSkeleton, BentoLoadingSkeletonTypography } from '@adyen/bento-vue3';
import styles from './PayoutSkeleton.module.scss';

// "Funds captured" and "Adjustments" usually have a breakdown, so they render as collapsed expandable cards.
const EXPANDABLE_BREAKDOWN_COUNT = 2;
</script>

<template>
    <BentoLoadingSkeleton :class="styles.root" aria-hidden="true">
        <BentoCard>
            <template #content>
                <div :class="styles.summary">
                    <BentoLoadingSkeletonTypography :class="styles.summaryLabel" :lines="1" :last-line-width="100" />
                    <BentoLoadingSkeletonTypography :class="styles.amount" :lines="1" :last-line-width="100" text-style="title-m" />
                    <BentoLoadingSkeletonTypography :class="styles.date" :lines="1" :last-line-width="100" />
                    <div>
                        <BentoLoadingSkeletonTypography :class="styles.accountDescription" :lines="1" :last-line-width="100" text-style="body-wide" />
                        <BentoLoadingSkeletonTypography :class="styles.accountId" :lines="1" :last-line-width="100" />
                    </div>
                </div>
            </template>
        </BentoCard>

        <div :class="styles.breakdowns">
            <!-- Disabled keeps the collapsed card inert (no focus, no toggle) while preserving its exact header geometry -->
            <BentoCard v-for="index in EXPANDABLE_BREAKDOWN_COUNT" :key="index" expandable closed disabled>
                <template #header>
                    <div :class="styles.row">
                        <BentoLoadingSkeletonTypography :class="styles.rowLabel" :lines="1" :last-line-width="100" />
                        <BentoLoadingSkeletonTypography :class="styles.rowValue" :lines="1" :last-line-width="100" />
                    </div>
                </template>
            </BentoCard>
            <BentoCard>
                <template #content>
                    <div :class="[styles.row, styles.rowSummary]">
                        <BentoLoadingSkeletonTypography :class="styles.rowLabel" :lines="1" :last-line-width="100" />
                        <BentoLoadingSkeletonTypography :class="styles.rowValue" :lines="1" :last-line-width="100" />
                    </div>
                </template>
            </BentoCard>
        </div>

        <BentoCard background="secondary">
            <template #content>
                <div :class="[styles.row, styles.rowSummary]">
                    <BentoLoadingSkeletonTypography :class="styles.rowLabel" :lines="1" :last-line-width="100" />
                    <BentoLoadingSkeletonTypography :class="styles.rowValue" :lines="1" :last-line-width="100" />
                </div>
            </template>
        </BentoCard>
    </BentoLoadingSkeleton>
</template>
