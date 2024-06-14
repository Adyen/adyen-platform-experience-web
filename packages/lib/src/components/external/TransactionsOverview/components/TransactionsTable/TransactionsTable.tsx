import Category from '../Category/Category';
import DataOverviewError from '../../../../internal/DataOverviewError/DataOverviewError';
import { getLabel } from '../../../../utils/getLabel';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useCallback, useMemo, useState } from 'preact/hooks';
import DataGrid from '../../../../internal/DataGrid';
import Pagination from '../../../../internal/Pagination';
import { CellTextPosition } from '../../../../internal/DataGrid/types';
import { TranslationKey } from '../../../../../core/Localization/types';
import { getCurrencyCode } from '../../../../../core/Localization/amount/amount-util';
import { AMOUNT_CLASS, BASE_CLASS, DATE_AND_PAYMENT_METHOD_CLASS } from './constants';
import './TransactionTable.scss';
import { mediaQueries, useResponsiveViewport } from '../../hooks/useResponsiveViewport';
import { FC } from 'preact/compat';
import { TransactionTableProps } from './types';
import PaymentMethodCell from './PaymentMethodCell';

// Remove status column temporarily
// const FIELDS = ['createdAt', 'status', 'paymentMethod', 'transactionType', 'amount'] as const;
const FIELDS = ['dateAndPaymentMethod', 'createdAt', 'paymentMethod', 'transactionType', 'amount'] as const;
type FieldsType = (typeof FIELDS)[number];

export const TransactionsTable: FC<TransactionTableProps> = ({
    availableCurrencies,
    error,
    hasMultipleCurrencies,
    loading,
    onContactSupport,
    onRowClick,
    showDetails,
    showPagination,
    transactions,
    ...paginationProps
}) => {
    const { i18n } = useCoreContext();
    const [hoveredRow, setHoveredRow] = useState<undefined | number>();
    const isSmViewport = useResponsiveViewport(mediaQueries.up.sm);
    const isMdViewport = useResponsiveViewport(mediaQueries.up.md);
    const isXsViewport = useResponsiveViewport(mediaQueries.down.xs);

    const fieldsVisibility: Partial<Record<FieldsType, boolean>> = useMemo(
        () => ({
            dateAndPaymentMethod: isXsViewport,
            createdAt: isSmViewport,
            transactionType: isMdViewport,
            paymentMethod: isSmViewport,
        }),
        [isXsViewport, isSmViewport, isMdViewport]
    );

    const columns = useMemo(
        () =>
            FIELDS.map(key => {
                const label = i18n.get(getLabel(key));
                if (key === 'amount') {
                    return {
                        key,
                        label: hasMultipleCurrencies
                            ? label
                            : `${label} ${availableCurrencies && availableCurrencies[0] ? `(${getCurrencyCode(availableCurrencies[0])})` : ''}`,
                        position: key === 'amount' ? CellTextPosition.RIGHT : undefined,
                        flex: isSmViewport ? 1.5 : undefined,
                    };
                }

                return { key, label, visible: fieldsVisibility[key] };
            }),
        [availableCurrencies, fieldsVisibility, hasMultipleCurrencies, i18n, isSmViewport]
    );

    const EMPTY_TABLE_MESSAGE = {
        title: 'noTransactionsFound',
        message: ['tryDifferentSearchOrResetYourFiltersAndWeWillTryAgain'],
    } satisfies { title: TranslationKey; message: TranslationKey | TranslationKey[] };

    const onHover = useCallback(
        (index?: number) => {
            setHoveredRow(index ?? undefined);
        },
        [setHoveredRow]
    );

    const errorDisplay = useMemo(
        () => () => <DataOverviewError error={error} onContactSupport={onContactSupport} errorMessage={'weCouldNotLoadYourTransactions'} />,
        [error, onContactSupport]
    );

    return (
        <div className={BASE_CLASS}>
            <DataGrid
                errorDisplay={errorDisplay}
                error={error}
                columns={columns}
                data={transactions}
                loading={loading}
                outline={false}
                onRowClick={{ callback: onRowClick }}
                onRowHover={onHover}
                emptyTableMessage={EMPTY_TABLE_MESSAGE}
                customCells={{
                    // Remove status column temporarily
                    /* status: ({ value }) => {
                        return (
                            <Tag
                                label={i18n.get(value)}
                                variant={value === 'Booked' ? TagVariant.SUCCESS : value === 'Reversed' ? TagVariant.ERROR : TagVariant.DEFAULT}
                            />
                        );
                    },*/
                    dateAndPaymentMethod: ({ item }) => {
                        return (
                            <div className={DATE_AND_PAYMENT_METHOD_CLASS}>
                                <PaymentMethodCell paymentMethod={item.paymentMethod} bankAccount={item.bankAccount} />
                                <span className={DATE_AND_PAYMENT_METHOD_CLASS}>
                                    {i18n.date(item.createdAt, {
                                        month: 'short',
                                        day: 'numeric',
                                        year: undefined,
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false,
                                    })}
                                </span>
                            </div>
                        );
                    },
                    transactionType: ({ item, rowIndex }) => {
                        const tooltipKey = `tooltip.${item.category}`;
                        return item.category ? (
                            i18n.has(tooltipKey) ? (
                                <Category value={item.category} isContainerHovered={rowIndex === hoveredRow} />
                            ) : (
                                item.category
                            )
                        ) : null;
                    },
                    createdAt: ({ value }) => <span>{i18n.fullDate(value)}</span>,
                    amount: ({ value }) => {
                        const amount = i18n.amount(value.value, value.currency, { hideCurrency: !hasMultipleCurrencies });
                        return <span className={AMOUNT_CLASS}>{amount}</span>;
                    },
                    paymentMethod: ({ item }) => <PaymentMethodCell paymentMethod={item.paymentMethod} bankAccount={item.bankAccount} />,
                }}
            >
                {showPagination && (
                    <DataGrid.Footer>
                        <Pagination {...paginationProps} />
                    </DataGrid.Footer>
                )}
            </DataGrid>
        </div>
    );
};
