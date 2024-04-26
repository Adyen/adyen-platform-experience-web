import useBalanceAccounts from '../../../../hooks/useBalanceAccounts';
import DataOverviewContainer from '../../../../internal/DataOverviewContainer/DataOverviewContainer';
import type { DataOverviewComponentProps, ExternalUIComponentProps } from '../../../../types';
import { TransactionsOverview } from '../TransactionsOverview/TransactionsOverview';
import { BASE_CLASS } from './constants';
import Theme from '../../../../../theme/Theme';

function TransactionsOverviewContainer({ ...props }: ExternalUIComponentProps<DataOverviewComponentProps>) {
    const { balanceAccounts, isBalanceAccountIdWrong, isFetching, error } = useBalanceAccounts(props.balanceAccountId);

    /*    $my-neutral-scale: generate-grey-scale(#ffe6c9, 0);
    $my-primary-scale: generate-color-scale(#8b2f00, 32);
    $my-label-scale: generate-color-scale(#1d1d1d, 32);
    $my-primary-background: #fffaf8;

    $my-critical-scale: generate-color-scale(#f00, 19);
    $my-success-scale: generate-color-scale(#25c000, 17);
    $my-warning-scale: generate-color-scale(#25c000, 17);*/

    new Theme({ primary: '#8b2f00', neutral: '#ffe6c9', label: '#1d1d1d' /*outline: '#ff0000'*/ }).apply();

    return (
        <DataOverviewContainer
            balanceAccountsError={error}
            className={BASE_CLASS}
            errorMessage={'weCouldNotLoadTheTransactionsOverview'}
            isBalanceAccountIdWrong={isBalanceAccountIdWrong}
            onContactSupport={props.onContactSupport}
        >
            <TransactionsOverview {...props} balanceAccounts={balanceAccounts} isLoadingBalanceAccount={isFetching} />
        </DataOverviewContainer>
    );
}

export default TransactionsOverviewContainer;
