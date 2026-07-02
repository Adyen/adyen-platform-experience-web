import { ref, computed, watch } from 'vue';
import type { TranslationKey } from '@integration-components/core';

export const enum TransactionsView {
    TRANSACTIONS = 'transactions',
    INSIGHTS = 'insights',
}

export const TRANSACTIONS_VIEW_TABS = [
    { id: TransactionsView.TRANSACTIONS, label: 'transactions.overview.views.transactions' as TranslationKey, content: null },
    { id: TransactionsView.INSIGHTS, label: 'transactions.overview.views.insights' as TranslationKey, content: null },
] as const;

interface UseTransactionsViewSwitcherProps {
    view?: TransactionsView;
}

export function useTransactionsViewSwitcher(props: () => UseTransactionsViewSwitcherProps) {
    const preferredViewTab = computed(() => TRANSACTIONS_VIEW_TABS.find(({ id }) => id === props().view));
    const preferredView = computed(() => preferredViewTab.value?.id ?? TransactionsView.TRANSACTIONS);
    const viewTabs = computed(() => (preferredViewTab.value ? ([preferredViewTab.value] as const) : TRANSACTIONS_VIEW_TABS));

    const activeView = ref<TransactionsView>(preferredView.value);

    watch(preferredView, newView => {
        activeView.value = newView;
    });

    const onViewChange = (value: string | number) => {
        const found = viewTabs.value.find(t => t.id === value)?.id;
        if (found) activeView.value = found;
    };

    return { activeView, onViewChange, viewTabs } as const;
}
