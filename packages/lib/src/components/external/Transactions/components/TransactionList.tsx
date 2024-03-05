import { BalanceAccountProps } from '@src/components';
import Modal from '@src/components/internal/Modal';
import Spinner from '@src/components/internal/Spinner';
import useCoreContext from '@src/core/Context/useCoreContext';
import useModalDetails from '@src/hooks/useModalDetails/useModalDetails';
import { ITransaction } from '@src/types';
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
import { CurrencyCode, TranslationKey } from '@src/core/Localization/types';
import TransactionListError from './TransactionListError/TransactionListError';
import { getCurrencyCode } from '@src/core/Localization/amount/amount-util';

const ModalContent = lazy(() => import('./ModalContent'));

const FIELDS = ['creationDate', 'status', 'paymentMethod', 'type', 'currency', 'amount'] as const;

function TransactionList({
    balanceAccountDescription,
    loading,
    transactions,
    onTransactionSelected,
    showPagination,
    showDetails,
    error,
    onContactSupport,
    balanceAccounts,
    ...paginationProps
}: TransactionListProps & BalanceAccountProps) {
    const { i18n } = useCoreContext();

    const hasMultipleCurrencies = balanceAccounts && balanceAccounts.length > 1;

    const columns = useMemo(
        () =>
            FIELDS.map(key => {
                const label = i18n.get(getLabel(key));
                if (key === 'amount')
                    return {
                        key,
                        label: hasMultipleCurrencies
                            ? label
                            : `${label} ${
                                  balanceAccounts && balanceAccounts[0] ? `(${getCurrencyCode(balanceAccounts[0].defaultCurrencyCode)})` : ''
                              }`,
                        position: key === 'amount' ? CellTextPosition.RIGHT : undefined,
                    };

                return { key, label };
            }),
        [balanceAccounts, hasMultipleCurrencies, i18n]
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
        (value: ITransaction) => {
            updateDetails({
                selection: { type: 'transaction', data: { ...value, balanceAccountDescription } },
                modalSize: 'small',
            }).callback({ id: value.id });
        },
        [updateDetails, balanceAccountDescription]
    );

    const EMPTY_TABLE_MESSAGE = {
        title: 'weDidNotFindAnyTransaction',
        message: ['thereAreNoTransactionsForThisRequirements', 'tryAgainPlease'],
    } satisfies { title: TranslationKey; message: TranslationKey | TranslationKey[] };

    const errorDisplay = useMemo(() => () => <TransactionListError error={error} onContactSupport={onContactSupport} />, [error, onContactSupport]);
    return (
        <>
            <DataGrid
                errorDisplay={errorDisplay}
                error={error}
                columns={columns}
                data={transactions}
                loading={loading}
                outline={false}
                onRowClick={{ callback: onRowClick }}
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
                    type: ({ item }) => {
                        return item.category ? i18n.get(`txType.${item.category}`) : null;
                    },
                    creationDate: ({ value }) => i18n.fullDate(value),
                    amount: ({ value }) => {
                        const amount = i18n.amount(value.value, value.currency, {
                            currencyDisplay: hasMultipleCurrencies ? 'symbol' : 'name',
                            showSign: value.value < 0,
                        });

                        return (
                            <span className={classnames('adyen-fp-transactions__amount')}>
                                {hasMultipleCurrencies ? amount : amount.split(' ')[0]}
                            </span>
                        );
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
                title={selectedDetail?.title ? i18n.get(selectedDetail.title) : undefined}
                isOpen={!!selectedDetail}
                aria-label={i18n.get('transactionDetails')}
                onClose={resetDetails}
                isDismissible={true}
                headerWithBorder={false}
                size={selectedDetail?.modalSize ?? 'large'}
            >
                {selectedDetail && (
                    <Suspense fallback={<Spinner />}>
                        <ModalContent data={selectedDetail.selection.data} />
                    </Suspense>
                )}
            </Modal>
        </>
    );
}

export default TransactionList;
