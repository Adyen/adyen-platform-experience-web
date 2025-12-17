import { classes } from '../../constants';
import { useCallback } from 'preact/hooks';
import { TransactionsListProps } from './types';
import { ITransaction } from '../../../../../types';
import { TransactionsTable } from '../TransactionsTable/TransactionsTable';
import { DataDetailsModal } from '../../../../internal/DataOverviewDisplay/DataDetailsModal';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import useAnalyticsContext from '../../../../../core/Context/analytics/useAnalyticsContext';
import useModalDetails from '../../../../../hooks/useModalDetails/useModalDetails';

const TransactionsList = ({
    availableCurrencies,
    balanceAccount,
    dataCustomization,
    hasMultipleCurrencies,
    loadingBalanceAccounts,
    loadingTransactions,
    onContactSupport,
    onLimitSelection,
    onRecordSelection,
    showDetails,
    transactionsError,
    transactionsFields,
    transactions,
    ...paginationProps
}: TransactionsListProps) => {
    const userEvents = useAnalyticsContext();

    const { updateDetails, resetDetails, selectedDetail } = useModalDetails({
        transaction: {
            showDetails: showDetails ?? true,
            callback: onRecordSelection,
        },
    });

    const onRowClick = useCallback(
        ({ id, category }: ITransaction) => {
            if (category) {
                userEvents.addEvent?.('Viewed transaction details', {
                    transactionType: category,
                    category: 'Transaction component',
                    subCategory: 'Transaction details',
                });
            }
            updateDetails({
                selection: {
                    data: id,
                    type: 'transaction',
                    balanceAccount,
                },
                modalSize: 'small',
            }).callback({ id });
        },
        [balanceAccount, updateDetails, userEvents]
    );

    return (
        <DataDetailsModal
            ariaLabelKey="transactions.details.title"
            dataCustomization={dataCustomization?.details}
            selectedDetail={selectedDetail as ReturnType<typeof useModalDetails>['selectedDetail']}
            resetDetails={resetDetails}
            className={classes.details}
        >
            <TransactionsTable
                activeBalanceAccount={balanceAccount}
                availableCurrencies={availableCurrencies as (typeof availableCurrencies)[number][]}
                error={transactionsError as AdyenPlatformExperienceError}
                hasMultipleCurrencies={hasMultipleCurrencies}
                loading={loadingBalanceAccounts || loadingTransactions}
                onContactSupport={onContactSupport}
                onLimitSelection={onLimitSelection}
                onRowClick={onRowClick}
                showPagination={true}
                transactions={transactions}
                customColumns={transactionsFields}
                {...paginationProps}
            />
        </DataDetailsModal>
    );
};

export default TransactionsList;
