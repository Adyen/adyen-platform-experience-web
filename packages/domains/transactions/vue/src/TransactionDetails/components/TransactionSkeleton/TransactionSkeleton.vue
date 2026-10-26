<script setup lang="ts">
import { computed } from 'vue';
import { BentoCard, BentoLoadingSkeleton, BentoLoadingSkeletonShape, BentoLoadingSkeletonTypography } from '@adyen/bento-vue3';
import layoutStyles from '../TransactionDataLayout.module.scss';
import statusBoxStyles from '../PaymentDetails/PaymentDetailsStatusBox.module.scss';
import { useModalContext } from '@integration-components/core/vue';
import { useShouldHideTitles } from '@integration-components/composables-vue';
import styles from './TransactionSkeleton.module.scss';

// The title is already rendered by the caller when the skeleton is shown on top of loaded data (refetch).
const props = withDefaults(defineProps<{ withTitle?: boolean }>(), { withTitle: true });

const { withinModal } = useModalContext();
const hideTitles = useShouldHideTitles();
const showTitle = computed(() => props.withTitle && !withinModal && !hideTitles.value);

// Account, reference ID, merchant reference and PSP reference are present on most transactions.
const FIELD_COUNT = 4;
</script>

<template>
    <div aria-hidden="true">
        <BentoLoadingSkeleton v-if="showTitle" :class="styles.title">
            <BentoLoadingSkeletonTypography :class="styles.titleText" :lines="1" :last-line-width="100" text-style="title" />
        </BentoLoadingSkeleton>

        <BentoLoadingSkeleton :class="layoutStyles.root">
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
                            <BentoLoadingSkeletonTypography
                                :class="styles.paymentMethodDetail"
                                :lines="1"
                                :last-line-width="100"
                                text-style="title"
                            />
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
    </div>
</template>
