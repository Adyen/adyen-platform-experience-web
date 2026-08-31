<script setup lang="ts">
import { BentoStructuredList, BentoTypography } from '@adyen/bento-vue3';
import type { TranslationKey } from '@integration-components/core';
import type { ListItemData } from '@integration-components/payByLink/domain';
import PaymentLinkTabsListItem from './PaymentLinkTabsListItem.vue';
import styles from './PaymentLinkTabs.module.scss';
import { usePayByLinkContext } from '../../../integration/context';

const props = defineProps<{
    items: ListItemData[];
    heading?: TranslationKey;
}>();

const { i18n } = usePayByLinkContext();
</script>

<template>
    <BentoTypography v-if="props.heading" variant="body" stronger :class="styles.listHeading">
        {{ i18n.get(props.heading) }}
    </BentoTypography>
    <BentoStructuredList>
        <PaymentLinkTabsListItem v-for="item in props.items" :key="item.key" :item="item" />
    </BentoStructuredList>
</template>
