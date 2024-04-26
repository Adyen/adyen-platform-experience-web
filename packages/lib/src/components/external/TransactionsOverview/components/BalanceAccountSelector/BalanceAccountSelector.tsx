import { memo } from 'preact/compat';
import { useCallback } from 'preact/hooks';
import Select from '@src/components/internal/FormFields/Select';
import useBalanceAccountSelection from './useBalanceAccountSelection';
import './BalanceAccountSelector.scss';
import { mediaQueries, useMediaQuery } from '@src/components/external/TransactionsOverview/hooks/useMediaQuery';
import { SelectItem, SelectProps } from '@src/components/internal/FormFields/Select/types';
import { DROPDOWN_ELEMENT_CONTENT_CLASS } from '@src/components/internal/FormFields/Select/constants';
import { renderSelectListItemDefaultSingleSelected } from '@src/components/internal/FormFields/Select/components/SelectListItem';

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
        const isSmViewport = useMediaQuery(mediaQueries.down.xs);

        const renderListItem = useCallback<_GetRenderListItemType<typeof balanceAccountSelectionOptions>>(
            data => (
                <>
                    <div className={DROPDOWN_ELEMENT_CONTENT_CLASS}>
                        {data.item.name && <span className={BA_SELECTOR_ACCOUNT_LABEL_CLASS}>{data.item.name}</span>}
                        <span className={BA_SELECTOR_ACCOUNT_ID_CLASS}>{data.item.id}</span>
                    </div>
                    {renderSelectListItemDefaultSingleSelected(data)}
                </>
            ),
            []
        );

        return balanceAccountSelectionOptions && balanceAccountSelectionOptions.length > 1 ? (
            <Select
                popoverClassNameModifiers={[BA_SELECTOR_CLASS]}
                onChange={onBalanceAccountSelection}
                filterable={false}
                multiSelect={false}
                selected={activeBalanceAccount?.id}
                withoutCollapseIndicator={true}
                items={balanceAccountSelectionOptions}
                renderListItem={renderListItem}
                showOverlay={isSmViewport}
            />
        ) : null;
    }
);

export default BalanceAccountSelector;
