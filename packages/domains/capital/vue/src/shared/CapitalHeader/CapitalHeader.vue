<script setup lang="ts">
import { computed } from 'vue';
import { BentoButtonActions, BentoHeader, BentoTypography, type BentoButtonActionsList } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import type { TranslationKey } from '@integration-components/core';
import styles from './CapitalHeader.module.scss';

const props = defineProps<{
    actions?: BentoButtonActionsList;
    hideSubtitle?: boolean;
    hideTitle?: boolean;
    region?: string;
    titleKey: TranslationKey;
}>();

const { i18n } = useCoreContext();
const title = computed(() => (props.hideTitle ? undefined : i18n.get(props.titleKey)));
const description = computed(() => {
    const key = `capital.common.loanProviderInfo.${props.region}`;
    return !props.hideSubtitle && i18n.has(key) ? i18n.get(key) : undefined;
});
</script>

<template>
    <div v-if="title || description || props.actions?.length" :class="styles.root" data-testid="capital-header">
        <BentoHeader v-if="title" variant="component" :title="title" :description="description" :actions="props.actions" />
        <div v-else :class="styles.titlelessContent">
            <BentoTypography v-if="description" el="div" :class="styles.description">
                {{ description }}
            </BentoTypography>
            <BentoButtonActions v-if="props.actions?.length" :actions="props.actions" />
        </div>
    </div>
</template>
