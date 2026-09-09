<script setup lang="ts">
import { BentoButton, BentoHeader } from '@adyen/bento-vue3';
import CrossIcon from '@adyen/ui-assets-icons-16/vue/cross';
import type { TranslationKey } from '@integration-components/core';
import { useCoreContext } from '@integration-components/core/vue';
import styles from './GrantAdjustmentDetails.module.scss';

const props = defineProps<{
    className?: string;
    headerSubtitleKey?: TranslationKey;
    headerTitleKey?: TranslationKey;
    onDetailsClose: () => void;
}>();

const { i18n } = useCoreContext();
</script>

<template>
    <div :class="[styles.root, props.className]">
        <div :class="styles.header">
            <BentoHeader
                v-if="props.headerTitleKey"
                :title="i18n.get(props.headerTitleKey)"
                :description="props.headerSubtitleKey ? i18n.get(props.headerSubtitleKey) : undefined"
                variant="component"
            />
            <BentoButton variant="tertiary" :aria-label="i18n.get('common.actions.dismiss.labels.dismiss')" @click="props.onDetailsClose">
                <CrossIcon />
            </BentoButton>
        </div>
        <slot />
    </div>
</template>
