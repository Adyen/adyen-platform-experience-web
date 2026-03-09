import { ref, computed, watch } from 'vue';
import { TRANSACTIONS_VIEW_TABS } from '../constants';
import { TransactionsView } from '../types';

export interface UseTransactionsViewSwitcherProps {
    view?: TransactionsView;
}

export function useTransactionsViewSwitcher(props?: () => UseTransactionsViewSwitcherProps) {
    const preferredViewTab = computed(() => {
        const view = props?.().view;
        return TRANSACTIONS_VIEW_TABS.find(({ id }) => id === view);
    });

    const preferredView = computed(() => preferredViewTab.value?.id ?? TransactionsView.TRANSACTIONS);

    const viewTabs = computed(() => (preferredViewTab.value ? ([preferredViewTab.value] as const) : TRANSACTIONS_VIEW_TABS));

    const activeView = ref<TransactionsView>(preferredView.value);

    const onViewChange = (item: { id: TransactionsView }) => {
        const view = viewTabs.value.find(tab => tab.id === item.id)?.id;
        if (view) activeView.value = view;
    };

    watch(preferredView, newView => {
        activeView.value = newView;
    });

    return { activeView, onViewChange, viewTabs };
}

export default useTransactionsViewSwitcher;
