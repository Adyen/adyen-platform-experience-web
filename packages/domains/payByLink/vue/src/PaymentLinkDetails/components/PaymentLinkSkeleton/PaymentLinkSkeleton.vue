<script setup lang="ts">
import { BentoLoadingSkeleton, BentoLoadingSkeletonShape, BentoLoadingSkeletonTypography } from '@adyen/bento-vue3';
import styles from './PaymentLinkSkeleton.module.scss';

const TAB_LABEL_COUNT = 3;
const FIELD_COUNT = 6;
</script>

<template>
    <BentoLoadingSkeleton :class="styles.root">
        <div :class="styles.summaryContainer">
            <div :class="styles.status">
                <BentoLoadingSkeletonShape variant="rectangle" />
            </div>
            <BentoLoadingSkeletonTypography :class="styles.amount" :lines="1" :last-line-width="100" text-style="title-l" />
            <BentoLoadingSkeletonTypography :class="styles.expirationDate" :lines="1" :last-line-width="100" />
        </div>
        <div :class="styles.tabsContainer">
            <div :class="styles.tabLabelsContainer">
                <BentoLoadingSkeletonTypography
                    v-for="index in TAB_LABEL_COUNT"
                    :key="index"
                    :class="styles.tabLabel"
                    :lines="1"
                    :last-line-width="100"
                />
            </div>
            <div :class="styles.fieldsContainer">
                <div v-for="index in FIELD_COUNT" :key="index" :class="styles.fieldContainer">
                    <BentoLoadingSkeletonTypography :class="styles.fieldLabel" :lines="1" :last-line-width="100" />
                    <BentoLoadingSkeletonTypography :class="styles.fieldValue" :lines="1" :last-line-width="100" />
                </div>
            </div>
        </div>
    </BentoLoadingSkeleton>
</template>
