<script setup lang="ts">
import { computed } from 'vue';
import { BentoHeader, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import type { TranslationKey } from '@integration-components/core';
import styles from './CapitalHeader.module.scss';

const props = defineProps<{
    hideTitle?: boolean;
    region?: string;
    titleKey: TranslationKey;
}>();

const { i18n } = useCoreContext();
const title = computed(() => i18n.get(props.titleKey));
const description = computed(() => {
    const key = `capital.common.loanProviderInfo.${props.region}`;
    return i18n.has(key) ? i18n.get(key) : undefined;
});
</script>

<template>
    <div :class="styles.root">
        <BentoTypography v-if="props.hideTitle" el="div" :class="styles.description">
            {{ description }}
        </BentoTypography>
        <BentoHeader v-else variant="component" :title="title" :description="description" />
    </div>
</template>
