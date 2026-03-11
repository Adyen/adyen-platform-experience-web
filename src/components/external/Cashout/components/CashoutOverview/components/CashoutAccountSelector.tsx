import { FunctionalComponent } from 'preact';
import BalanceAccountSelector from '../../../../../internal/FormFields/Select/BalanceAccountSelector';
import useBalanceAccountSelection from '../../../../../../hooks/useBalanceAccountSelection';
import { CASHOUT_OVERVIEW_CLASS_NAMES } from '../constants';

type CashoutAccountSelectorProps = Pick<
    ReturnType<typeof useBalanceAccountSelection>,
    'activeBalanceAccount' | 'balanceAccountSelectionOptions' | 'onBalanceAccountSelection'
>;

export const CashoutAccountSelector: FunctionalComponent<CashoutAccountSelectorProps> = ({
    activeBalanceAccount,
    balanceAccountSelectionOptions,
    onBalanceAccountSelection,
}) => {
    if (!activeBalanceAccount || balanceAccountSelectionOptions.length <= 1) return null;

    return (
        <div className={CASHOUT_OVERVIEW_CLASS_NAMES.accountSelector}>
            <BalanceAccountSelector
                activeBalanceAccount={activeBalanceAccount}
                balanceAccountSelectionOptions={balanceAccountSelectionOptions}
                onBalanceAccountSelection={onBalanceAccountSelection}
            />
        </div>
    );
};
