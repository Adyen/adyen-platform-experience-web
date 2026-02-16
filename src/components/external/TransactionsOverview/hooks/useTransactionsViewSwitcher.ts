import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { TRANSACTIONS_VIEW_TABS } from '../constants';
import { TransactionsView } from '../types';

export interface UseTransactionsViewSwitcherProps {
    view?: TransactionsView;
}

const useTransactionsViewSwitcher = ({ view }: UseTransactionsViewSwitcherProps = {}) => {
    const preferredViewTab = useMemo(() => TRANSACTIONS_VIEW_TABS.find(({ id }) => id === view), [view]);
    const preferredView = useMemo(() => preferredViewTab?.id ?? TransactionsView.TRANSACTIONS, [preferredViewTab]);
    const viewTabs = useMemo(() => (preferredViewTab ? ([preferredViewTab] as const) : TRANSACTIONS_VIEW_TABS), [preferredViewTab]);

    const [activeView, setActiveView] = useState(preferredView);

    const onViewChange = useCallback(
        <T extends { id: TransactionsView }>({ id }: T) => {
            const activeView = viewTabs.find(tab => tab.id === id)?.id;
            activeView && setActiveView(activeView);
        },
        [viewTabs]
    );

    useEffect(() => {
        setActiveView(preferredView);
    }, [preferredView]);

    return { activeView, onViewChange, viewTabs } as const;
};

export default useTransactionsViewSwitcher;
