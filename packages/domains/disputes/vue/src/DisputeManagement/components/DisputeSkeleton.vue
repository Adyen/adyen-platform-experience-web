<script setup lang="ts">
import { BentoCard, BentoLoadingSkeleton, BentoLoadingSkeletonShape, BentoLoadingSkeletonTypography } from '@adyen/bento-vue3';
import styles from './DisputeSkeleton.module.scss';

// 7 rows are present on almost every dispute, plus one status-dependent date (respond by / accepted on / expired on).
const FIELD_COUNT = 8;
</script>

<template>
    <BentoLoadingSkeleton :class="styles.root" aria-hidden="true">
        <BentoCard>
            <template #content>
                <div :class="styles.summary">
                    <div :class="styles.tags">
                        <div :class="[styles.tag, styles.typeTag]">
                            <BentoLoadingSkeletonShape variant="rectangle" />
                        </div>
                        <div :class="[styles.tag, styles.statusTag]">
                            <BentoLoadingSkeletonShape variant="rectangle" />
                        </div>
                    </div>
                    <BentoLoadingSkeletonTypography :class="styles.amount" :lines="1" :last-line-width="100" text-style="title-l" />
                    <div :class="styles.paymentMethod">
                        <div :class="styles.paymentMethodLogo">
                            <BentoLoadingSkeletonShape variant="rectangle" />
                        </div>
                        <BentoLoadingSkeletonTypography :class="styles.paymentMethodDetail" :lines="1" :last-line-width="100" text-style="title" />
                    </div>
                </div>
            </template>
        </BentoCard>

        <div>
            <div v-for="index in FIELD_COUNT" :key="index" :class="styles.field">
                <div :class="styles.fieldLabel">
                    <BentoLoadingSkeletonTypography :class="styles.fieldLabelSkeleton" :lines="1" :last-line-width="100" />
                </div>
                <div :class="styles.fieldValue">
                    <BentoLoadingSkeletonTypography :class="styles.fieldValueSkeleton" :lines="1" :last-line-width="100" />
                </div>
            </div>
        </div>
    </BentoLoadingSkeleton>
</template>
