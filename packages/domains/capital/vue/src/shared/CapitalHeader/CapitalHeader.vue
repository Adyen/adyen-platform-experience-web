<script setup lang="ts">
import { computed } from 'vue';
import { BentoButtonActions, BentoHeader, BentoTypography, type BentoButtonActionsList } from '@adyen/bento-vue3';
import { useCoreContext, useModalContext, useShouldHideTitles } from '@integration-components/core/vue';
import styles from './CapitalHeader.module.scss';
import { IContractType } from '@integration-components/types';

const props = defineProps<{
    actions?: BentoButtonActionsList;
    contractType?: IContractType;
    hideSubtitle?: boolean;
    region?: string;
    title: string;
}>();

const { i18n } = useCoreContext();
const { withinModal } = useModalContext();
const hideTitles = useShouldHideTitles();
const title = computed(() => (hideTitles.value || withinModal ? undefined : props.title));
const subtitle = computed(() => {
    const keyBase = `capital.common.providerInfo.${props.region}`;
    const key = props.contractType === 'cashAdvance' ? `${keyBase}.cashAdvance` : keyBase;
    return !props.hideSubtitle && i18n.has(key) ? i18n.get(key) : undefined;
});
</script>

<template>
    <div v-if="title || subtitle || props.actions?.length" data-testid="capital-header">
        <BentoHeader v-if="title" variant="component" :title="title" :description="subtitle" :actions="props.actions" />
        <div v-else :class="styles.titlelessContent">
            <BentoTypography v-if="subtitle" el="div" :class="styles.description">
                {{ subtitle }}
            </BentoTypography>
            <BentoButtonActions v-if="props.actions?.length" :actions="props.actions" />
        </div>
    </div>
</template>
