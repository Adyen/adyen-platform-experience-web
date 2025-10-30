import { IBalanceAccountBase } from '../../../../types';
import { FilterType } from '../../../../core/Analytics/analytics/user-events';
import useBalanceAccountSelection from '../../../../hooks/useBalanceAccountSelection';
import useFilterEvent from './useFilterEvent';
import { useRef } from 'preact/hooks';

export interface UseBalanceAccountSelectorPropsConfig {
    onUpdateSelection?: (account?: IBalanceAccountBase) => void;
    allowAllSelection?: boolean;
    balanceAccounts?: IBalanceAccountBase[];
    eventCategory?: string;
    eventLabel?: FilterType;
}

const useBalanceAccountSelectorProps = ({
    onUpdateSelection,
    allowAllSelection,
    balanceAccounts,
    eventCategory,
    eventLabel = 'Balance account filter',
}: UseBalanceAccountSelectorPropsConfig) => {
    // prettier-ignore
    const {
        activeBalanceAccount,
        balanceAccountSelectionOptions,
        onBalanceAccountSelection,
    } = useBalanceAccountSelection(balanceAccounts, allowAllSelection);

    const { logEvent } = useFilterEvent({ category: eventCategory, label: eventLabel });

    const cachedBalanceAccountIdRef = useRef<string | undefined>();
    const cachedBalanceAccountId = cachedBalanceAccountIdRef.current;
    const currentBalanceAccountId = activeBalanceAccount?.id;

    if (cachedBalanceAccountId !== currentBalanceAccountId) {
        // Update the cached balance account id with current
        cachedBalanceAccountIdRef.current = currentBalanceAccountId;

        if (cachedBalanceAccountId && currentBalanceAccountId) {
            // Balance account changed from previous to current (using selector)
            // Log filter modification event for balance account filter
            logEvent?.('update', currentBalanceAccountId);
        }

        // Set active balance account in transactions overview context
        onUpdateSelection?.(activeBalanceAccount);
    }

    return { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } as const;
};

export default useBalanceAccountSelectorProps;
