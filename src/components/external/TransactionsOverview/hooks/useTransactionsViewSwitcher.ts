import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { TransactionsView, TransactionsOverviewMode } from '../types';
import { TRANSACTIONS_VIEW_TABS } from '../constants';

export interface UseTransactionsViewSwitcherProps {
    mode?: TransactionsOverviewMode;
}

const useTransactionsViewSwitcher = ({ mode }: UseTransactionsViewSwitcherProps = {}) => {
    const { view, viewTabs } = useMemo(() => {
        let preferredView: TransactionsView | undefined = undefined;

        if (mode === 'insights') preferredView = TransactionsView.INSIGHTS;
        if (mode === 'transactions') preferredView = TransactionsView.TRANSACTIONS;

        const preferredViewTab = TRANSACTIONS_VIEW_TABS.find(({ id }) => id === preferredView);
        const viewTabs = preferredViewTab ? ([preferredViewTab] as const) : TRANSACTIONS_VIEW_TABS;
        const view = preferredViewTab?.id ?? TransactionsView.TRANSACTIONS;

        return { view, viewTabs } as const;
    }, [mode]);

    const [activeView, setActiveView] = useState(view);
    const isTransactionsView = activeView === TransactionsView.TRANSACTIONS;

    const onViewChange = useCallback(
        <T extends { id: TransactionsView }>({ id }: T) => {
            const activeView = viewTabs.find(tab => tab.id === id)?.id;
            activeView && setActiveView(activeView);
        },
        [viewTabs]
    );

    useEffect(() => {
        setActiveView(view);
    }, [view]);

    return { activeView, isTransactionsView, onViewChange, viewTabs } as const;
};

export default useTransactionsViewSwitcher;
