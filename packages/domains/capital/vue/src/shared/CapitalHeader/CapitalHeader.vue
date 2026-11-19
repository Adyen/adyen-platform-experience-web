<script setup lang="ts">
import { computed } from 'vue';
import { BentoButtonActions, BentoHeader, BentoTypography, type BentoButtonActionsList } from '@adyen/bento-vue3';
import { useModalContext, useShouldHideTitles } from '@integration-components/core/vue';
import styles from './CapitalHeader.module.scss';

const props = defineProps<{
    actions?: BentoButtonActionsList;
    subtitle?: string;
    title: string;
}>();

const { withinModal } = useModalContext();
const hideTitles = useShouldHideTitles();
const title = computed(() => (hideTitles.value || withinModal ? undefined : props.title));
</script>

<template>
    <div v-if="title || props.subtitle || props.actions?.length" data-testid="capital-header">
        <BentoHeader v-if="title" variant="component" :title="title" :description="props.subtitle" :actions="props.actions" />
        <div v-else :class="styles.titlelessContent">
            <BentoTypography v-if="props.subtitle" el="div" :class="styles.description">
                {{ props.subtitle }}
            </BentoTypography>
            <BentoButtonActions v-if="props.actions?.length" :actions="props.actions" />
        </div>
    </div>
</template>
