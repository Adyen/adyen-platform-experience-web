<script setup lang="ts">
import { computed } from 'vue';
import { BentoCard, BentoLoadingSkeleton, BentoLoadingSkeletonTypography } from '@adyen/bento-vue3';
import { useModalContext } from '@integration-components/core/vue';
import { useShouldHideTitles } from '@integration-components/composables-vue';
import styles from './PayoutSkeleton.module.scss';

const { withinModal } = useModalContext();
const hideTitles = useShouldHideTitles();
const showTitle = computed(() => !withinModal && !hideTitles.value);

// "Funds captured" and "Adjustments" usually have a breakdown, so they render as collapsed expandable cards.
const EXPANDABLE_BREAKDOWN_COUNT = 2;
</script>

<template>
    <div aria-hidden="true">
        <BentoLoadingSkeleton v-if="showTitle" :class="styles.pageTitle">
            <BentoLoadingSkeletonTypography :class="styles.pageTitleText" :lines="1" :last-line-width="100" text-style="title" />
        </BentoLoadingSkeleton>

        <BentoLoadingSkeleton :class="styles.root">
            <BentoCard>
                <template #content>
                    <div :class="styles.summary">
                        <BentoLoadingSkeletonTypography :class="styles.summaryLabel" :lines="1" :last-line-width="100" />
                        <BentoLoadingSkeletonTypography :class="styles.amount" :lines="1" :last-line-width="100" text-style="title-m" />
                        <BentoLoadingSkeletonTypography :class="styles.date" :lines="1" :last-line-width="100" />
                        <div>
                            <BentoLoadingSkeletonTypography
                                :class="styles.accountDescription"
                                :lines="1"
                                :last-line-width="100"
                                text-style="body-wide"
                            />
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
    </div>
</template>
