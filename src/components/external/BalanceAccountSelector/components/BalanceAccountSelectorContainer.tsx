import useBalanceAccounts from '../hooks/useBalanceAccounts';
import useBalanceAccountSelection from '../hooks/useBalanceAccountSelection';
import BalanceAccountSelector from './BalanceAccountSelector';
import type { BalanceAccountSelectorComponentProps } from '../../../types';

export function BalanceAccountSelectorContainer(props: BalanceAccountSelectorComponentProps) {
    const { balanceAccounts /*, isBalanceAccountIdWrong, isFetching, error */ } = useBalanceAccounts(props.balanceAccountId);
    const { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } = useBalanceAccountSelection(balanceAccounts);

    return (
        <BalanceAccountSelector
            activeBalanceAccount={activeBalanceAccount}
            balanceAccountSelectionOptions={balanceAccountSelectionOptions}
            onBalanceAccountSelection={onBalanceAccountSelection}
            // ref={(ref: UIElement<BalanceAccountSelectorComponentProps>) => void (this.componentRef = ref)}
        />
    );
}

export default BalanceAccountSelectorContainer;
