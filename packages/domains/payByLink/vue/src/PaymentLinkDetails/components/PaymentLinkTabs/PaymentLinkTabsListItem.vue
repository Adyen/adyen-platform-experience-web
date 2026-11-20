<script setup lang="ts">
import { computed } from 'vue';
import { BentoLink, BentoStructuredListItem, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { CopyText } from '@integration-components/composables-vue';
import { BACKEND_REDACTED_DATA_MARKER, FRONTEND_REDACTED_DATA_MARKER, type ListItemData } from '@integration-components/payByLink/domain';
import styles from './PaymentLinkTabs.module.scss';

const props = defineProps<{
    item: ListItemData;
}>();

const { i18n } = useCoreContext();
const isRedacted = computed(() => typeof props.item.value === 'string' && props.item.value.includes(BACKEND_REDACTED_DATA_MARKER));
</script>

<template>
    <BentoStructuredListItem :label="i18n.get(props.item.key)">
        <BentoTypography v-if="isRedacted" variant="body">
            {{ FRONTEND_REDACTED_DATA_MARKER }}
        </BentoTypography>

        <div v-else-if="props.item.isCopyable" :class="styles.copyableValue">
            <CopyText
                :copy-button-aria-label-key="props.item.copyAriaLabelKey"
                :show-copy-text-tooltip="false"
                :text-to-copy="props.item.value ?? ''"
                type="Default"
            >
                <BentoLink v-if="props.item.linkUrl" :to="props.item.linkUrl" target="_blank" rel="noopener noreferrer" external>
                    {{ props.item.value }}
                </BentoLink>
                <BentoTypography v-else variant="body">
                    {{ props.item.value }}
                </BentoTypography>
            </CopyText>
        </div>

        <BentoTypography v-else variant="body">
            {{ props.item.value }}
        </BentoTypography>
    </BentoStructuredListItem>
</template>
