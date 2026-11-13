<script setup lang="ts">
import { computed } from 'vue';
import { BentoFormLayoutGroup, BentoLoadingSkeleton, BentoLoadingSkeletonShape, BentoLoadingSkeletonTypography } from '@adyen/bento-vue3';
import styles from './PaymentLinkCreationForm.module.scss';

const props = withDefaults(
    defineProps<{
        step?: string;
        showNavigation?: boolean;
        stepCount?: number;
    }>(),
    { step: 'store', showNavigation: false, stepCount: 4 }
);

const fieldLayouts = computed(() =>
    props.step === 'customer'
        ? ([undefined, '50-50', undefined, undefined, undefined, '66-33', '33-33-33', undefined] as const)
        : Array.from({ length: props.step === 'payment' ? 6 : 1 }, () => undefined)
);
</script>

<template>
    <BentoLoadingSkeleton :class="styles.skeleton" aria-busy="true" data-testid="payment-link-creation-skeleton">
        <div v-if="props.showNavigation" :class="styles.skeletonStepper">
            <div v-for="stepIndex in props.stepCount" :key="stepIndex" :class="styles.skeletonStep" data-testid="form-skeleton-step">
                <div :class="styles.skeletonStepNumber">
                    <BentoLoadingSkeletonShape variant="circle" />
                </div>
                <div :class="styles.skeletonStepLabel">
                    <BentoLoadingSkeletonTypography text-style="body" :lines="1" :last-line-width="100" />
                </div>
            </div>
        </div>

        <template v-if="props.step === 'summary'">
            <div v-for="(rowCount, section) in [6, 5]" :key="section" :class="styles.skeletonSection" data-testid="form-skeleton-summary-section">
                <div :class="styles.skeletonSectionTitle">
                    <BentoLoadingSkeletonTypography text-style="title" :lines="1" :last-line-width="100" />
                </div>
                <div v-for="row in rowCount" :key="row" :class="styles.skeletonSummaryRow">
                    <div :class="styles.skeletonSummaryLabel">
                        <BentoLoadingSkeletonTypography text-style="body" :lines="1" :last-line-width="100" />
                    </div>
                    <div :class="styles.skeletonSummaryValue">
                        <BentoLoadingSkeletonTypography text-style="body" :lines="1" :last-line-width="100" />
                    </div>
                </div>
            </div>
            <div :class="styles.skeletonAlert">
                <BentoLoadingSkeletonShape variant="rectangle" />
            </div>
        </template>

        <div v-else :class="styles.skeletonFields">
            <component :is="layout ? BentoFormLayoutGroup : 'div'" v-for="(layout, row) in fieldLayouts" :key="row" :layout="layout">
                <div v-for="field in layout?.split('-').length ?? 1" :key="field" :class="styles.skeletonField" data-testid="form-skeleton-field">
                    <div :class="styles.skeletonLabel">
                        <BentoLoadingSkeletonTypography text-style="body" :lines="1" :last-line-width="100" />
                    </div>
                    <div :class="styles.skeletonControl">
                        <BentoLoadingSkeletonShape variant="rectangle" />
                    </div>
                    <div v-if="props.step === 'payment' && (row === 0 || row === 4)" :class="styles.skeletonSupportText">
                        <BentoLoadingSkeletonTypography text-style="caption" :lines="1" :last-line-width="100" />
                    </div>
                </div>
            </component>
        </div>

        <div v-if="props.showNavigation" :class="styles.skeletonActions">
            <div :class="styles.skeletonButton">
                <BentoLoadingSkeletonShape variant="rectangle" />
            </div>
        </div>
    </BentoLoadingSkeleton>
</template>
