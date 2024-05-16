import { memo } from 'preact/compat';
import Select from '../../../../internal/FormFields/Select';
import useBalanceAccountSelection from './useBalanceAccountSelection';
import './BalanceAccountSelector.scss';
import { mediaQueries, useMediaQuery } from '../../hooks/useMediaQuery';

const BalanceAccountSelector = memo(
    ({
        activeBalanceAccount,
        balanceAccountSelectionOptions,
        onBalanceAccountSelection,
    }: Omit<ReturnType<typeof useBalanceAccountSelection>, 'resetBalanceAccountSelection'>) => {
        const isSmViewport = useMediaQuery(mediaQueries.down.xs);

        return balanceAccountSelectionOptions && balanceAccountSelectionOptions.length > 1 ? (
            <Select
                popoverClassNameModifiers={['adyen-pe-balance-account-selector']}
                onChange={onBalanceAccountSelection}
                filterable={false}
                multiSelect={false}
                selected={activeBalanceAccount?.id}
                withoutCollapseIndicator={true}
                items={balanceAccountSelectionOptions}
                showOverlay={isSmViewport}
            />
        ) : null;
    }
);

export default BalanceAccountSelector;
