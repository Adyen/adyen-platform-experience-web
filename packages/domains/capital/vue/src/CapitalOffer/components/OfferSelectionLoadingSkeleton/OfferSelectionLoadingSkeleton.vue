<script setup lang="ts">
import { BentoLoadingSkeletonShape, BentoLoadingSkeletonTypography } from '@adyen/bento-vue3';
import { useShouldHideTitles } from '@integration-components/core/vue';
import styles from './OfferSelectionLoadingSkeleton.module.scss';

const hideTitles = useShouldHideTitles();
</script>

<template>
    <div :class="styles.root">
        <div :class="styles.header">
            <BentoLoadingSkeletonTypography v-if="!hideTitles" text-style="title-l" :lines="1" :last-line-width="50" />
            <BentoLoadingSkeletonTypography :lines="1" :last-line-width="70" />
        </div>
        <BentoLoadingSkeletonTypography text-style="title-l" :lines="1" :last-line-width="20" />
        <BentoLoadingSkeletonShape variant="rectangle" height="76px" />
        <BentoLoadingSkeletonTypography :lines="1" :last-line-width="40" />
        <BentoLoadingSkeletonShape variant="rectangle" height="84px" />
        <BentoLoadingSkeletonShape variant="rectangle" height="208px" />
        <div :class="styles.actions">
            <BentoLoadingSkeletonShape variant="rectangle" height="36px" width="125px" />
        </div>
    </div>
</template>
