import Modal from '../../../../internal/Modal';
import { popoverUtil } from '../../../../internal/Popover/utils/popoverUtil';
import Spinner from '../../../../internal/Spinner';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useModalDetails from '../../../../../hooks/useModalDetails/useModalDetails';
import { ITransaction } from '../../../../../types';
import { FC, lazy, Suspense } from 'preact/compat';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { BASE_CLASS, SPINNER_CONTAINER_CLASS } from './constants';
import './TransactionsDisplay.scss';
import { TransactionDisplayProps } from './types';
import { TransactionsTable } from '../TransactionsTable/TransactionsTable';

const ModalContent = lazy(() => import('../TransactionDetailsModal/TransactionDetailsModal'));

export const TransactionsDisplay: FC<TransactionDisplayProps> = ({
    availableCurrencies,
    balanceAccountDescription,
    error,
    loading,
    onContactSupport,
    onTransactionSelected,
    showDetails,
    showPagination,
    transactions,
    ...paginationProps
}: TransactionDisplayProps) => {
    const { i18n } = useCoreContext();
    const hasMultipleCurrencies = !!availableCurrencies && availableCurrencies.length > 1;

    const transactionDetails = useMemo(
        () => ({
            showDetails: showDetails ?? true,
            callback: onTransactionSelected,
        }),
        [showDetails, onTransactionSelected]
    );

    const modalOptions = useMemo(() => ({ transaction: transactionDetails }), [transactionDetails]);

    const { updateDetails, resetDetails, selectedDetail } = useModalDetails(modalOptions);

    const onRowClick = useCallback(
        (value: ITransaction) => {
            updateDetails({
                selection: { type: 'transaction', data: { ...value, balanceAccountDescription } },
                modalSize: 'small',
            }).callback({ id: value.id });
        },
        [updateDetails, balanceAccountDescription]
    );

    const isModalOpen = !!selectedDetail;

    useEffect(() => {
        if (isModalOpen) {
            popoverUtil.closeAll();
        }
    }, [isModalOpen]);

    return (
        <div className={BASE_CLASS}>
            <TransactionsTable
                availableCurrencies={availableCurrencies}
                error={error}
                hasMultipleCurrencies={hasMultipleCurrencies}
                loading={loading}
                onContactSupport={onContactSupport}
                onRowClick={onRowClick}
                onTransactionSelected={onTransactionSelected}
                showPagination={showPagination}
                transactions={transactions}
                {...paginationProps}
            />
            <Modal
                title={selectedDetail?.title ? i18n.get(selectedDetail.title) : undefined}
                isOpen={!!selectedDetail}
                aria-label={i18n.get('transactionDetails')}
                onClose={resetDetails}
                isDismissible={true}
                headerWithBorder={false}
                size={selectedDetail?.modalSize ?? 'large'}
            >
                {selectedDetail && (
                    <Suspense
                        fallback={
                            <span className={SPINNER_CONTAINER_CLASS}>
                                <Spinner size={'medium'} />
                            </span>
                        }
                    >
                        <ModalContent data={selectedDetail.selection.data} />
                    </Suspense>
                )}
            </Modal>
        </div>
    );
};
