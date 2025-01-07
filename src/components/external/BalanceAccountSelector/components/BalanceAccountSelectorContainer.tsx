import BalanceAccountSelector from './BalanceAccountSelector';
import useBalanceAccounts from '../hooks/useBalanceAccounts';
import useBalanceAccountSelection from '../hooks/useBalanceAccountSelection';
import type { BalanceAccountSelectorComponentProps, UIComponentProps } from '../../../types';

function BalanceAccountSelectorContainer(props: UIComponentProps<BalanceAccountSelectorComponentProps>) {
    const { balanceAccounts /*, error, isBalanceAccountIdWrong, isFetching */ } = useBalanceAccounts(props);
    const { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } = useBalanceAccountSelection(balanceAccounts);

    return (
        <BalanceAccountSelector
            activeBalanceAccount={activeBalanceAccount}
            balanceAccountSelectionOptions={balanceAccountSelectionOptions}
            onBalanceAccountSelection={onBalanceAccountSelection}
            hideSingleBalanceAccount={false}
        />
    );
}

export default BalanceAccountSelectorContainer;
