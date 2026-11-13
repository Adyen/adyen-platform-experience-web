<script setup lang="ts">
import { computed } from 'vue';
import { BentoButtonActions, BentoEmptyState, type BentoButtonActionsList } from '@adyen/bento-vue3';
import SuccessIcon from '@adyen/ui-assets-icons-24/vue/checkmark-circle';
import ErrorIcon from '@adyen/ui-assets-icons-24/vue/cross-circle';
import HighlightIcon from '@adyen/ui-assets-icons-24/vue/info';
import styles from './EmptyState.module.scss';

const props = defineProps<{
    actions?: BentoButtonActionsList;
    title: string;
    type: 'highlight' | 'error' | 'success';
}>();

const ICONS = { highlight: HighlightIcon, error: ErrorIcon, success: SuccessIcon } as const;
const ICON_CLASSES = { highlight: undefined, error: styles.iconCritical, success: styles.iconSuccess } as const;

const iconComponent = computed(() => ICONS[props.type]);
const iconClass = computed(() => ICON_CLASSES[props.type]);
</script>

<template>
    <div :class="styles.root">
        <component :is="iconComponent" aria-hidden="true" :class="iconClass" />
        <BentoEmptyState variant="basic" :title="title">
            <slot />
        </BentoEmptyState>
        <BentoButtonActions v-if="actions?.length" :actions="actions" :class="styles.actions" />
    </div>
</template>
