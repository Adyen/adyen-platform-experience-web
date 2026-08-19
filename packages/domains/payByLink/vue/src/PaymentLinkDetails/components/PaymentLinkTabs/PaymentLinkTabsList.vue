<script setup lang="ts">
import { BentoStructuredList, BentoTypography } from '@adyen/bento-vue3';
import type { TranslationKey } from '@integration-components/core';
import { useCoreContext } from '@integration-components/core/vue';
import { useUniqueId } from '@integration-components/composables-vue';
import type { ListItemData } from '@integration-components/payByLink/domain';
import PaymentLinkTabsListItem from './PaymentLinkTabsListItem.vue';

const props = defineProps<{
    items: ListItemData[];
    heading?: TranslationKey;
    copiedItemId?: string;
}>();

const emit = defineEmits<{
    copied: [copyId: string];
    clearCopied: [];
}>();

const { i18n } = useCoreContext();
const listId = useUniqueId();
</script>

<template>
    <BentoTypography v-if="props.heading" variant="body" stronger class="adyen-pe-payment-link-tabs__list-heading">
        {{ i18n.get(props.heading) }}
    </BentoTypography>
    <BentoStructuredList class="adyen-pe-payment-link-tabs__list">
        <PaymentLinkTabsListItem
            v-for="(item, index) in props.items"
            :key="item.key"
            :item="item"
            :copy-id="`${listId}-${index}`"
            :copied-item-id="props.copiedItemId"
            @copied="emit('copied', $event)"
            @clear-copied="emit('clearCopied')"
        />
    </BentoStructuredList>
</template>
