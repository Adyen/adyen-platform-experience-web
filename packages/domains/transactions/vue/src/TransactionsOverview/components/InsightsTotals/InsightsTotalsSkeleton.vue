<script setup lang="ts">
import { BentoDivider, BentoLoadingSkeleton, BentoLoadingSkeletonTypography } from '@adyen/bento-vue3';
import totalsStyles from './InsightsTotals.module.scss';
import styles from './InsightsTotalsSkeleton.module.scss';

// Incoming and outgoing
const BREAKDOWN_COUNT = 2;
// Periods usually span a few transaction categories per breakdown, e.g. "Payment", "Transfer" and "Capital".
const BREAKDOWN_ROW_COUNT = 3;
</script>

<template>
    <BentoLoadingSkeleton aria-hidden="true">
        <div :class="totalsStyles.amountDisplay">
            <BentoLoadingSkeletonTypography :class="styles.label" :lines="1" :last-line-width="100" />
            <div :class="totalsStyles.amountDisplayAmount">
                <BentoLoadingSkeletonTypography :class="styles.periodAmount" :lines="1" :last-line-width="100" text-style="title-m" />
            </div>
        </div>

        <div :class="totalsStyles.breakdowns">
            <div v-for="breakdown in BREAKDOWN_COUNT" :key="breakdown" :class="totalsStyles.breakdown">
                <div :class="totalsStyles.amountDisplay">
                    <BentoLoadingSkeletonTypography :class="styles.label" :lines="1" :last-line-width="100" />
                    <div :class="totalsStyles.amountDisplayAmount">
                        <BentoLoadingSkeletonTypography :class="styles.amount" :lines="1" :last-line-width="100" />
                    </div>
                </div>
                <div :class="styles.rows">
                    <div v-for="row in BREAKDOWN_ROW_COUNT" :key="row" :class="styles.row">
                        <BentoLoadingSkeletonTypography :class="styles.rowLabel" :lines="1" :last-line-width="100" />
                        <BentoLoadingSkeletonTypography :class="styles.rowValue" :lines="1" :last-line-width="100" />
                    </div>
                </div>
            </div>
            <BentoDivider :class="totalsStyles.divider" variant="vertical" />
        </div>
    </BentoLoadingSkeleton>
</template>
