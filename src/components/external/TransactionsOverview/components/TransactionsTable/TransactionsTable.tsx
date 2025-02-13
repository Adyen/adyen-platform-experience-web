import { FC } from 'preact/compat';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { DATE_FORMAT_TRANSACTIONS_MOBILE, DATE_FORMAT_TRANSACTIONS } from '../../../../../constants';
import Category from '../Category/Category';
import DataOverviewError from '../../../../internal/DataOverviewError/DataOverviewError';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { getCurrencyCode } from '../../../../../core/Localization/amount/amount-util';
import { TranslationKey } from '../../../../../translations';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';
import DataGrid from '../../../../internal/DataGrid';
import { CellTextPosition } from '../../../../internal/DataGrid/types';
import Pagination from '../../../../internal/Pagination';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { containerQueries, useResponsiveViewport } from '../../../../../hooks/useResponsiveViewport';
import { AMOUNT_CLASS, BASE_CLASS, DATE_AND_PAYMENT_METHOD_CLASS, DATE_METHOD_CLASS } from './constants';
import './TransactionTable.scss';
import PaymentMethodCell from './PaymentMethodCell';
import { TransactionTableProps } from './types';
import { useTableColumns } from '../../../../../hooks/useTableColumns';

// Remove status column temporarily
// const FIELDS = ['createdAt', 'status', 'paymentMethod', 'transactionType', 'amount'] as const;

export const TRANSACTION_FIELDS = ['createdAt', 'paymentMethod', 'transactionType', 'amount'] as const;
export type TransactionsTableCols = (typeof TRANSACTION_FIELDS)[number];

export const TransactionsTable: FC<TransactionTableProps> = ({
    activeBalanceAccount,
    availableCurrencies,
    error,
    hasMultipleCurrencies,
    loading,
    onContactSupport,
    onRowClick,
    showDetails,
    showPagination,
    transactions,
    customColumns,
    ...paginationProps
}) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting(activeBalanceAccount?.timeZone);
    const [hoveredRow, setHoveredRow] = useState<undefined | number>();
    const isSmAndUpViewport = useResponsiveViewport(containerQueries.up.sm);
    const isMdAndUpViewport = useResponsiveViewport(containerQueries.up.md);
    const isXsAndDownViewport = useResponsiveViewport(containerQueries.down.xs);

    const amountLabel = i18n.get('amount');
    const columns = useTableColumns({
        fields: TRANSACTION_FIELDS,
        customColumns,
        columnConfig: {
            amount: {
                label: hasMultipleCurrencies
                    ? undefined
                    : `${amountLabel} ${availableCurrencies && availableCurrencies[0] ? `(${getCurrencyCode(availableCurrencies[0])})` : ''}`,
                position: CellTextPosition.RIGHT,
                flex: isSmAndUpViewport ? 1.5 : undefined,
            },
            transactionType: { visible: isMdAndUpViewport },
            paymentMethod: { visible: isSmAndUpViewport },
        },
    });

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

                    transactionType: ({ item, rowIndex }) => {
                        const tooltipKey = `tooltip.${item.category}`;
                        return item.category ? (
                            i18n.has(tooltipKey) ? (
                                <Category isContainerHovered={rowIndex === hoveredRow} value={item.category} />
                            ) : (
                                <Typography variant={TypographyVariant.BODY}>
                                    {i18n.has(`txType.${item.category}`) ? i18n.get(`txType.${item.category}`) : `${item.category}`}
                                </Typography>
                            )
                        ) : null;
                    },
                    amount: ({ value }) => {
                        const amount = i18n.amount(value.value, value.currency, { hideCurrency: !hasMultipleCurrencies });
                        return (
                            <Typography variant={TypographyVariant.BODY} className={AMOUNT_CLASS}>
                                {amount}
                            </Typography>
                        );
                    },
                    createdAt: ({ item, value }) => {
                        if (isXsAndDownViewport) {
                            return (
                                <div className={DATE_AND_PAYMENT_METHOD_CLASS}>
                                    <PaymentMethodCell paymentMethod={item.paymentMethod} bankAccount={item.bankAccount} />
                                    <Typography variant={TypographyVariant.BODY} className={DATE_METHOD_CLASS}>
                                        {dateFormat(item.createdAt, DATE_FORMAT_TRANSACTIONS_MOBILE)}
                                    </Typography>
                                </div>
                            );
                        }
                        return <Typography variant={TypographyVariant.BODY}>{dateFormat(value, DATE_FORMAT_TRANSACTIONS)}</Typography>;
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
