import classnames from 'classnames';
import useCoreContext from '@src/core/Context/useCoreContext';
import DataGrid from '../../../internal/DataGrid';
import Pagination from '../../../internal/Pagination';
import { getLabel } from './utils';
import Button from '@src/components/internal/Button';
import { TransactionListProps } from '../types';
import { ITransaction } from '../../../../types/models/api/transactions';
import Modal from '@src/components/internal/Modal';
import { lazy, Suspense } from 'preact/compat';
import Spinner from '@src/components/internal/Spinner';
import { TranslationKey } from '@src/core/Localization/types';
import { ModalSize } from '@src/components/internal/Modal/types';
import useModalDetails from '@src/hooks/useModalDetails/useModalDetails';
import { useMemo } from 'preact/hooks';

type SelectedDetail = {
    title: TranslationKey;
    selection: { type: 'accountHolder' | 'transaction' | 'balanceAccount'; detail: string };
    modalSize?: ModalSize;
};

function ModalContent({ selection }: SelectedDetail) {
    const TransactionData = lazy(() => import('../../TransactionDetails/components/TransactionDetails'));
    const AccountHolderDetails = lazy(() => import('../../AccountHolder/components/AccountHolderDetails'));
    const BalanceAccountDetails = lazy(() => import('../../BalanceAccount/components/BalanceAccountDetails'));

    if (!selection) return null;
    return (
        <Suspense fallback={<Spinner size="medium" />}>
            {selection.type === 'transaction' && <TransactionData transactionId={selection.detail} />}
            {selection.type === 'accountHolder' && <AccountHolderDetails accountHolderId={selection.detail} />}
            {selection.type === 'balanceAccount' && <BalanceAccountDetails balanceAccountId={selection.detail} />}
        </Suspense>
    );
}

function TransactionList({
    loading,
    transactions,
    onTransactionSelected,
    onBalanceAccountSelected,
    onAccountSelected,
    showPagination,
    showDetails,
    ...paginationProps
}: TransactionListProps) {
    const { i18n } = useCoreContext();
    const fields = ['id', 'type', 'balanceAccountId', 'accountHolderId', 'amount', 'createdAt', 'description'] as const;
    const columns = fields.map(key => ({ key, label: i18n.get(getLabel(key)) }));

    const modalOptions = useMemo(
        () => ({
            transaction: {
                showDetails: [showDetails?.transaction],
                callback: onTransactionSelected,
            },
            accountHolder: {
                showDetails: [showDetails?.accountHolder],
                callback: onAccountSelected,
            },
            balanceAccount: {
                showDetails: [showDetails?.balanceAccount],
                callback: onBalanceAccountSelected,
            },
        }),
        [showDetails, onTransactionSelected, onAccountSelected, onBalanceAccountSelected]
    );

    const { updateDetails, resetDetails, detailsToShow, selectedDetail } = useModalDetails(modalOptions);

    return (
        <>
            <DataGrid<ITransaction>
                columns={columns}
                data={transactions}
                loading={loading}
                customCells={{
                    id: ({ value }) =>
                        detailsToShow.transaction ? (
                            <Button
                                variant={'link'}
                                onClick={() => {
                                    updateDetails({
                                        title: 'transactionDetails',
                                        selection: { type: 'transaction', detail: value },
                                        modalSize: 'extra-large',
                                    }).callback({ id: value });
                                }}
                            >
                                {value}
                            </Button>
                        ) : (
                            value
                        ),
                    balanceAccountId: ({ value }) =>
                        detailsToShow.balanceAccount ? (
                            <Button
                                variant={'link'}
                                onClick={() => {
                                    updateDetails({
                                        title: 'balanceAccount',
                                        selection: { type: 'balanceAccount', detail: value },
                                        modalSize: 'extra-large',
                                    }).callback({ id: value });
                                }}
                            >
                                {value}
                            </Button>
                        ) : (
                            value
                        ),
                    accountHolderId: ({ value }) =>
                        detailsToShow.accountHolder ? (
                            <Button
                                variant={'link'}
                                onClick={() => {
                                    updateDetails({
                                        title: 'accountHolder',
                                        selection: { type: 'accountHolder', detail: value },
                                        modalSize: 'extra-large',
                                    }).callback({ id: value });
                                }}
                            >
                                {value}
                            </Button>
                        ) : (
                            value
                        ),
                    createdAt: ({ value }) => i18n.fullDate(value),
                    type: ({ value }) => value,
                    amount: ({ value }) => {
                        const amount = value?.currency
                            ? i18n.amount(value.value, value.currency, {
                                  currencyDisplay: 'code',
                                  showSign: true,
                              })
                            : null;

                        const isPositive = amount?.indexOf('-') === -1;

                        return (
                            <div
                                className={classnames('adyen-fp-amount', {
                                    'adyen-fp-amount--positive': isPositive,
                                    'adyen-fp-amount--negative': !isPositive,
                                })}
                            >
                                {amount}
                            </div>
                        );
                    },
                }}
            >
                {showPagination && (
                    <DataGrid.Footer>
                        <Pagination {...paginationProps} />
                    </DataGrid.Footer>
                )}
            </DataGrid>
            <Modal
                title={selectedDetail ? i18n.get(selectedDetail.title) : ''}
                isOpen={!!selectedDetail}
                onClose={resetDetails}
                size={selectedDetail?.modalSize ?? 'large'}
            >
                {selectedDetail && <ModalContent {...selectedDetail} />}
            </Modal>
        </>
    );
}

export default TransactionList;
