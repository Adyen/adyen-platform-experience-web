import BalanceAccountSelector from '../../../../internal/FormFields/Select/BalanceAccountSelector';
import useBalanceAccountSelection from '../../../../../hooks/useBalanceAccountSelection';
import { useTransactionsOverviewContext } from '../../context/TransactionsOverviewContext';
import { useRef } from 'preact/hooks';

const BalanceAccountFilter = () => {
    const { balanceAccounts, currentView, logFilterEvent, setBalanceAccount } = useTransactionsOverviewContext();
    const { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } = useBalanceAccountSelection(balanceAccounts);
    const cachedBalanceAccountIdRef = useRef<string | undefined>();

    const canRenderFilter = !!currentView;
    const cachedBalanceAccountId = cachedBalanceAccountIdRef.current;
    const currentBalanceAccountId = activeBalanceAccount?.id;

    if (cachedBalanceAccountId !== currentBalanceAccountId) {
        // Update the cached balance account id with current
        cachedBalanceAccountIdRef.current = currentBalanceAccountId;

        if (cachedBalanceAccountId && currentBalanceAccountId) {
            // Balance account changed from previous to current (using selector)
            // Log filter modification event for balance account filter
            logFilterEvent('Balance account filter', 'update', currentBalanceAccountId);
        }

        // Set active balance account in transactions overview context
        setBalanceAccount(activeBalanceAccount);
    }

    return (
        canRenderFilter && (
            <BalanceAccountSelector
                activeBalanceAccount={activeBalanceAccount}
                balanceAccountSelectionOptions={balanceAccountSelectionOptions}
                onBalanceAccountSelection={onBalanceAccountSelection}
            />
        )
    );
};

export default BalanceAccountFilter;
