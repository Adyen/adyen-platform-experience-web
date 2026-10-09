<script setup lang="ts">
import { computed } from 'vue';
import { BentoButtonActions, BentoEmptyState, BentoTypography, type BentoButtonActionsList } from '@adyen/bento-vue3';
import ErrorIcon from '@adyen/ui-assets-icons-24/vue/cross-circle';
import HighlightIcon from '@adyen/ui-assets-icons-24/vue/info';
import styles from './EmptyState.module.scss';

const props = defineProps<{
    actions?: BentoButtonActionsList;
    title: string;
    type: 'highlight' | 'error';
}>();

const iconComponent = computed(() => (props.type === 'highlight' ? HighlightIcon : ErrorIcon));
const iconClass = computed(() => (props.type === 'error' ? styles.iconCritical : undefined));
</script>

<template>
    <div :class="styles.root">
        <component :is="iconComponent" aria-hidden="true" :class="iconClass" />
        <BentoEmptyState variant="basic" :title="title">
            <BentoTypography>
                <slot />
            </BentoTypography>
        </BentoEmptyState>
        <BentoButtonActions v-if="actions?.length" :actions="actions" :class="styles.actions" />
    </div>
</template>
