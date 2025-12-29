import { useCallback } from 'preact/hooks';
import { TransactionsListProps } from './types';
import { ITransaction } from '../../../../../types';
import { TransactionDetailsModal } from './TransactionDetailsModal';
import { TransactionsTable } from '../TransactionsTable/TransactionsTable';
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
        <TransactionDetailsModal
            dataCustomization={dataCustomization}
            onContactSupport={onContactSupport}
            resetDetails={resetDetails}
            selectedDetail={selectedDetail as ReturnType<typeof useModalDetails>['selectedDetail']}
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
        </TransactionDetailsModal>
    );
};

export default TransactionsList;
