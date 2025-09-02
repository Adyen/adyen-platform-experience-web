import useBalanceAccountSelection, { ALL_BALANCE_ACCOUNTS_SELECTION_ID } from '../../../../../hooks/useBalanceAccountSelection';
import { memo } from 'preact/compat';
import { useCallback, useMemo } from 'preact/hooks';
import Select from '../../Select';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import { renderDefaultSingleSelectionCheckedness } from '../components/SelectListItem';
import { SelectItem, SelectProps } from '../types';
import './BalanceAccountSelector.scss';

type _GetRenderListItemType<T> = T extends Readonly<SelectItem[]> ? NonNullable<SelectProps<T[number]>['renderListItem']> : never;

const BA_SELECTOR_CLASS = 'adyen-pe-balance-account-selector';
const BA_SELECTOR_ACCOUNT_ID_CLASS = `${BA_SELECTOR_CLASS}__account-id` as const;
const BA_SELECTOR_ACCOUNT_LABEL_CLASS = `${BA_SELECTOR_CLASS}__account-label` as const;

const BalanceAccountSelector = memo(
    ({
        activeBalanceAccount,
        balanceAccountSelectionOptions,
        onBalanceAccountSelection,
    }: Omit<ReturnType<typeof useBalanceAccountSelection>, 'resetBalanceAccountSelection'>) => {
        const { i18n } = useCoreContext();
        const isSmContainer = useResponsiveContainer(containerQueries.down.xs);
        const balanceAccountLabel = useMemo(() => i18n.get('balanceAccount'), [i18n]);

        const allSelected = activeBalanceAccount?.id === ALL_BALANCE_ACCOUNTS_SELECTION_ID;
        const canRenderSelector = balanceAccountSelectionOptions && balanceAccountSelectionOptions.length > 1;

        const renderListItem = useCallback<_GetRenderListItemType<typeof balanceAccountSelectionOptions>>(
            data => (
                <>
                    <div className={data.contentClassName}>
                        {data.item.name && <span className={BA_SELECTOR_ACCOUNT_LABEL_CLASS}>{data.item.name}</span>}
                        {data.item.id !== ALL_BALANCE_ACCOUNTS_SELECTION_ID && (
                            <span className={data.item.name ? BA_SELECTOR_ACCOUNT_ID_CLASS : BA_SELECTOR_ACCOUNT_LABEL_CLASS}>{data.item.id}</span>
                        )}
                    </div>
                    {renderDefaultSingleSelectionCheckedness(data)}
                </>
            ),
            []
        );

        return (
            <>
                {canRenderSelector && (
                    <Select
                        popoverClassNameModifiers={[BA_SELECTOR_CLASS]}
                        onChange={onBalanceAccountSelection}
                        filterable={false}
                        multiSelect={false}
                        placeholder={activeBalanceAccount?.id || balanceAccountLabel}
                        selected={activeBalanceAccount?.id}
                        withoutCollapseIndicator={true}
                        items={balanceAccountSelectionOptions}
                        renderListItem={renderListItem}
                        showOverlay={isSmContainer}
                        aria-label={balanceAccountLabel}
                    />
                )}

                <div aria-label={balanceAccountLabel} className="adyen-pe-visually-hidden" role="status">
                    {activeBalanceAccount?.id &&
                        i18n.get(allSelected ? 'filter.accountStatus.all' : 'filter.accountStatus.id', {
                            values: { account: activeBalanceAccount.description || activeBalanceAccount.id },
                        })}
                </div>
            </>
        );
    }
);

export default BalanceAccountSelector;
