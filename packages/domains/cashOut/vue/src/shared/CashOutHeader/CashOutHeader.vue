<script setup lang="ts">
import { computed } from 'vue';
import { BentoHeader, type BentoHeaderReloadButton } from '@adyen/bento-vue3';
import type { TranslationKey } from '@integration-components/core';
import { useCoreContext } from '@integration-components/core/vue';
import BalanceAccountSelector from '../BalanceAccountSelector/BalanceAccountSelector.vue';
import styles from './CashOutHeader.module.scss';

const props = defineProps<{
    balanceAccountOptions: { label: string; value: string; description?: string | undefined }[];
    hideTitle?: boolean;
    titleKey: TranslationKey;
    /** When what is shown was loaded. With `onRefresh`, the header shows it with a button to load it again; without, when an error screen offers its own. */
    lastUpdated?: number | undefined;
    isRefreshing?: boolean;
    onRefresh?: () => void;
}>();

const selectedBalanceAccountId = defineModel<string | undefined>('selectedBalanceAccountId', { required: true });

const { i18n } = useCoreContext();

const reloadButton = computed<BentoHeaderReloadButton | undefined>(() =>
    props.onRefresh
        ? { title: i18n.get('cashOut.common.refresh.label'), event: props.onRefresh, state: props.isRefreshing ? 'loading' : 'start' }
        : undefined
);
</script>

<template>
    <div v-if="!props.hideTitle" :class="styles.root">
        <BentoHeader
            :class="styles.title"
            variant="component"
            :title="i18n.get(props.titleKey)"
            :last-updated="reloadButton ? props.lastUpdated : undefined"
            :reload-button="reloadButton"
        />
        <div :class="styles.selector">
            <BalanceAccountSelector v-model="selectedBalanceAccountId" :options="props.balanceAccountOptions" />
        </div>
    </div>
    <!-- Outside the component shell so another balance account can still be selected when one fails to load. -->
    <BalanceAccountSelector v-else v-model="selectedBalanceAccountId" :options="props.balanceAccountOptions" />
</template>
