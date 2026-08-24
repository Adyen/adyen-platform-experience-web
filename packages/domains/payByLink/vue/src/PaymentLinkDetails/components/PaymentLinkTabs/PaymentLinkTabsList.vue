<script setup lang="ts">
import { BentoStructuredList, BentoTypography } from '@adyen/bento-vue3';
import type { TranslationKey } from '@integration-components/core';
import { useCoreContext } from '@integration-components/core/vue';
import type { ListItemData } from '@integration-components/payByLink/domain';
import PaymentLinkTabsListItem from './PaymentLinkTabsListItem.vue';
import styles from './PaymentLinkTabs.module.scss';

const props = defineProps<{
    items: ListItemData[];
    heading?: TranslationKey;
}>();

const { i18n } = useCoreContext();
</script>

<template>
    <BentoTypography v-if="props.heading" variant="body" stronger :class="styles.listHeading">
        {{ i18n.get(props.heading) }}
    </BentoTypography>
    <BentoStructuredList>
        <PaymentLinkTabsListItem v-for="item in props.items" :key="item.key" :item="item" />
    </BentoStructuredList>
</template>
