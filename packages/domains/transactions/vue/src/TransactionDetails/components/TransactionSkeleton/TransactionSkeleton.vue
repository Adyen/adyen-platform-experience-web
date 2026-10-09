<script setup lang="ts">
import { BentoCard, BentoLoadingSkeleton, BentoLoadingSkeletonShape, BentoLoadingSkeletonTypography } from '@adyen/bento-vue3';
import layoutStyles from '../TransactionDataLayout.module.scss';
import statusBoxStyles from '../PaymentDetails/PaymentDetailsStatusBox.module.scss';
import styles from './TransactionSkeleton.module.scss';

// Account, reference ID, merchant reference and PSP reference are present on most transactions.
const FIELD_COUNT = 4;
</script>

<template>
    <BentoLoadingSkeleton :class="layoutStyles.root" aria-hidden="true">
        <BentoCard>
            <template #content>
                <div :class="[layoutStyles.container, statusBoxStyles.statusBox]">
                    <div :class="statusBoxStyles.tags">
                        <div :class="styles.tag">
                            <BentoLoadingSkeletonShape variant="rectangle" />
                        </div>
                    </div>
                    <BentoLoadingSkeletonTypography :class="styles.amount" :lines="1" :last-line-width="100" text-style="title-l" />
                    <div :class="statusBoxStyles.paymentMethod">
                        <div :class="[statusBoxStyles.paymentMethodLogoContainer, styles.paymentMethodLogo]">
                            <BentoLoadingSkeletonShape variant="rectangle" />
                        </div>
                        <BentoLoadingSkeletonTypography :class="styles.paymentMethodDetail" :lines="1" :last-line-width="100" text-style="title" />
                    </div>
                    <BentoLoadingSkeletonTypography :class="styles.date" :lines="1" :last-line-width="100" />
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
