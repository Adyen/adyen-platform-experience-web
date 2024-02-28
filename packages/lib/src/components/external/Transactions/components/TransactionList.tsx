import Modal from '@src/components/internal/Modal';
import Spinner from '@src/components/internal/Spinner';
import useCoreContext from '@src/core/Context/useCoreContext';
import useModalDetails from '@src/hooks/useModalDetails/useModalDetails';
import classnames from 'classnames';
import { lazy, Suspense } from 'preact/compat';
import { useCallback, useMemo } from 'preact/hooks';
import DataGrid from '../../../internal/DataGrid';
import Pagination from '../../../internal/Pagination';
import { TransactionListProps } from '../types';
import { getLabel, parsePaymentMethodType } from './utils';
import './TransactionList.scss';
import { Tag } from '@src/components/internal/Tag/Tag';
import { TagVariant } from '@src/components/internal/Tag/types';
import { CellTextPosition } from '@src/components/internal/DataGrid/types';
import { Image } from '@src/components/internal/Image/Image';
import { TranslationKey } from '@src/core/Localization/types';

const ModalContent = lazy(() => import('./ModalContent'));

const FIELDS = ['creationDate', 'status', 'paymentMethod', 'category', 'currency', 'amount'] as const;

function TransactionList({ loading, transactions, onTransactionSelected, showPagination, showDetails, ...paginationProps }: TransactionListProps) {
    const { i18n } = useCoreContext();
    const columns = useMemo(
        () => FIELDS.map(key => ({ key, label: i18n.get(getLabel(key)), position: key === 'amount' ? CellTextPosition.RIGHT : undefined })),
        [i18n]
    );

    const transactionDetails = useMemo(
        () => ({
            showDetails: [showDetails?.transaction],
            callback: onTransactionSelected,
        }),
        [showDetails?.transaction, onTransactionSelected]
    );

    const modalOptions = useMemo(() => ({ transaction: transactionDetails }), [transactionDetails]);

    const { updateDetails, resetDetails, selectedDetail } = useModalDetails(modalOptions);

    const onRowClick = useCallback(
        (value: string) => {
            updateDetails({
                title: 'transactionDetails',
                selection: { type: 'transaction', detail: value },
                modalSize: 'extra-large',
            }).callback({ id: value });
        },
        [updateDetails]
    );

    const EMPTY_TABLE_MESSAGE = {
        title: 'weDidNotFindAnyTransaction',
        message: ['thereAreNoTransactionsForThisRequirements', 'tryAgainPlease'],
    } satisfies { title: TranslationKey; message: TranslationKey | TranslationKey[] };

    return (
        <>
            <DataGrid
                columns={columns}
                data={transactions}
                loading={loading}
                outline={false}
                onRowClick={{ retrievedField: 'id', callback: onRowClick }}
                emptyTableMessage={EMPTY_TABLE_MESSAGE}
                customCells={{
                    status: ({ value }) => {
                        return (
                            <Tag
                                label={i18n.get(value)}
                                variant={value === 'Booked' ? TagVariant.SUCCESS : value === 'Rejected' ? TagVariant.ERROR : TagVariant.DEFAULT}
                            />
                        );
                    },
                    category: ({ value }) => {
                        return value ? i18n.get(`txType.${value}`) : null;
                    },
                    creationDate: ({ value }) => i18n.fullDate(value),
                    amount: ({ value }) => {
                        const amount = value?.currency
                            ? i18n.amount(value.value, value.currency, {
                                  currencyDisplay: 'code',
                                  showSign: true,
                              })
                            : null;

                        return <span className={classnames('adyen-fp-transactions__amount')}>{amount}</span>;
                    },
                    paymentMethod: ({ item }) => {
                        return (
                            <>
                                {item.paymentMethod || item.bankAccount ? (
                                    <div className="adyen-fp-transactions__payment-method">
                                        <div className="adyen-fp-transactions__payment-method-logo-container">
                                            <Image
                                                name={item.paymentMethod ? item.paymentMethod.type : 'bankTransfer'}
                                                alt={item.paymentMethod ? item.paymentMethod.type : 'bankTransfer'}
                                                folder={'logos/'}
                                                className={'adyen-fp-transactions__payment-method-logo'}
                                            />
                                        </div>
                                        {item.paymentMethod
                                            ? parsePaymentMethodType(item.paymentMethod)
                                            : item.bankAccount?.accountNumberLastFourDigits}
                                    </div>
                                ) : (
                                    <Tag label={i18n.get('noData')} variant={TagVariant.WHITE} />
                                )}
                            </>
                        );
                    },
                    currency: ({ item }) => {
                        return <Tag label={item.amount.currency} />;
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
                {selectedDetail && (
                    <Suspense fallback={<Spinner />}>
                        <ModalContent {...selectedDetail} />
                    </Suspense>
                )}
            </Modal>
        </>
    );
}

export default TransactionList;
