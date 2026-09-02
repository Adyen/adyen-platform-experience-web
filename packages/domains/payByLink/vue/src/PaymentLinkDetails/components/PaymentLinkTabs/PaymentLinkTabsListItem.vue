<script setup lang="ts">
import { computed } from 'vue';
import { BentoButton, BentoLink, BentoStructuredListItem, BentoTooltipDirective as vBentoTooltip, BentoTypography } from '@adyen/bento-vue3';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import { useCoreContext } from '@integration-components/core/vue';
import { BACKEND_REDACTED_DATA_MARKER, FRONTEND_REDACTED_DATA_MARKER, type ListItemData } from '@integration-components/payByLink/domain';
import styles from './PaymentLinkTabs.module.scss';

const props = defineProps<{
    item: ListItemData;
    copyId: string;
    copiedItemId?: string;
}>();

const emit = defineEmits<{
    copied: [copyId: string];
    clearCopied: [];
}>();

const { i18n } = useCoreContext();
const isCopied = computed(() => props.copiedItemId === props.copyId);
const isRedacted = computed(() => typeof props.item.value === 'string' && props.item.value.includes(BACKEND_REDACTED_DATA_MARKER));

function onCopy() {
    if (!props.item.value || !navigator.clipboard) return;
    navigator.clipboard.writeText(props.item.value);
    emit('copied', props.copyId);
}
</script>

<template>
    <BentoStructuredListItem :label="i18n.get(props.item.key)">
        <BentoTypography v-if="isRedacted" variant="body">{{ FRONTEND_REDACTED_DATA_MARKER }}</BentoTypography>

        <div v-else-if="props.item.isCopyable" :class="styles.copyableValue">
            <BentoLink v-if="props.item.linkUrl" :to="props.item.linkUrl" target="_blank" rel="noopener noreferrer" external>
                {{ props.item.value }}
            </BentoLink>
            <BentoTypography v-else variant="body">{{ props.item.value }}</BentoTypography>
            <BentoButton
                variant="tertiary"
                v-bento-tooltip="i18n.get(isCopied ? 'common.actions.copy.labels.done' : 'common.actions.copy.labels.default')"
                :aria-label="i18n.get('common.actions.copy.labels.default')"
                @click="onCopy"
                @blur="emit('clearCopied')"
                @mouseleave="emit('clearCopied')"
            >
                <CopyIcon />
            </BentoButton>
        </div>

        <BentoTypography v-else variant="body">{{ props.item.value }}</BentoTypography>
    </BentoStructuredListItem>
</template>
