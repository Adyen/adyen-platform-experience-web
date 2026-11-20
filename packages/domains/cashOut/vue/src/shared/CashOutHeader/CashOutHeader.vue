<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BentoHeader, type BentoHeaderReloadButton } from '@adyen/bento-vue3';
import type { TranslationKey } from '@integration-components/core';
import { useCoreContext } from '@integration-components/core/vue';
import BalanceAccountSelector from '../BalanceAccountSelector/BalanceAccountSelector.vue';
import styles from './CashOutHeader.module.scss';

// Bento's header tells how long ago the last update was only when it renders, so it gets the same time again, as a new Date, this often
// and when the page is shown again: browsers slow down the timers of a hidden page.
const LAST_UPDATED_TICK_MS = 30_000;

const props = defineProps<{
    balanceAccountOptions: { label: string; value: string; description?: string | undefined }[];
    hideTitle?: boolean;
    /** Keeps the selected balance account, for example while its cashOut is sent. */
    disableBalanceAccountSelector?: boolean;
    titleKey: TranslationKey;
    /** When what is shown was loaded. With `onRefresh`, the header shows it with a button to load it again; without, when an error screen offers its own. */
    lastUpdated?: number | undefined;
    isRefreshing?: boolean;
    onRefresh?: () => void;
    /** When the list of balance accounts closes, so what they can cash out is loaded again for the next time it opens. */
    onBalanceAccountSelectorClose?: () => void;
}>();

const selectedBalanceAccountId = defineModel<string | undefined>('selectedBalanceAccountId', { required: true });

const { i18n } = useCoreContext();

const reloadButton = computed<BentoHeaderReloadButton | undefined>(() =>
    props.onRefresh
        ? { title: i18n.get('cashOut.common.refresh.label'), event: props.onRefresh, state: props.isRefreshing ? 'loading' : 'start' }
        : undefined
);

const isShowingLastUpdated = computed(() => !props.hideTitle && !!reloadButton.value && props.lastUpdated !== undefined);
const tick = ref(0);
const lastUpdated = computed(() => {
    void tick.value;
    return isShowingLastUpdated.value && props.lastUpdated !== undefined ? new Date(props.lastUpdated) : undefined;
});

watch(
    isShowingLastUpdated,
    (isShowing, _, onCleanup) => {
        if (!isShowing) return;
        const timer = setInterval(() => tick.value++, LAST_UPDATED_TICK_MS);
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') tick.value++;
        };
        document.addEventListener('visibilitychange', onVisibilityChange);
        onCleanup(() => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        });
    },
    { immediate: true }
);
</script>

<template>
    <div v-if="!props.hideTitle" :class="styles.root">
        <BentoHeader
            :class="styles.title"
            variant="component"
            :title="i18n.get(props.titleKey)"
            :last-updated="lastUpdated"
            :reload-button="reloadButton"
        />
        <div :class="styles.selector">
            <BalanceAccountSelector
                v-model="selectedBalanceAccountId"
                :options="props.balanceAccountOptions"
                :disabled="props.disableBalanceAccountSelector"
                @close="props.onBalanceAccountSelectorClose?.()"
            />
        </div>
    </div>
    <!-- Outside the component shell so another balance account can still be selected when one fails to load. -->
    <BalanceAccountSelector
        v-else
        v-model="selectedBalanceAccountId"
        :options="props.balanceAccountOptions"
        :disabled="props.disableBalanceAccountSelector"
        @close="props.onBalanceAccountSelectorClose?.()"
    />
</template>
