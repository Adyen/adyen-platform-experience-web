import { FC } from 'preact/compat';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { DATE_FORMAT_TRANSACTIONS, DATE_FORMAT_TRANSACTIONS_MOBILE } from '../../../../../constants';
import DataOverviewError from '../../../../internal/DataOverviewError/DataOverviewError';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { getCurrencyCode } from '../../../../../core/Localization/amount/amount-util';
import { TranslationKey } from '../../../../../translations';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';
import DataGrid from '../../../../internal/DataGrid';
import Pagination from '../../../../internal/Pagination';
import { Tooltip } from '../../../../internal/Tooltip/Tooltip';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { getTransactionCategoryDescription, getTransactionCategory } from '../../../../utils/translation/getters';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import { AMOUNT_CLASS, BASE_CLASS, DATE_AND_PAYMENT_METHOD_CLASS, DATE_METHOD_CLASS } from './constants';
import './TransactionTable.scss';
import PaymentMethodCell from './PaymentMethodCell';
import { TransactionTableProps } from './types';
import { useTableColumns } from '../../../../../hooks/useTableColumns';

// Remove status column temporarily
// const FIELDS = ['createdAt', 'status', 'paymentMethod', 'transactionType', 'amount'] as const;

export const TRANSACTION_FIELDS = ['createdAt', 'paymentMethod', 'transactionType', 'amount'] as const;
export type TransactionsTableCols = (typeof TRANSACTION_FIELDS)[number];

const FIELDS_KEYS = {
    amount: 'transactions.overview.list.fields.amount',
    createdAt: 'transactions.overview.list.fields.createdAt',
    // currency: 'transactions.overview.list.fields.currency',
    paymentMethod: 'transactions.overview.list.fields.paymentMethod',
    // status: 'transactions.overview.list.fields.status',
    transactionType: 'transactions.overview.list.fields.transactionType',
} as const satisfies Partial<Record<TransactionsTableCols, TranslationKey>>;

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
    const isSmAndUpContainer = useResponsiveContainer(containerQueries.up.sm);
    const isMdAndUpContainer = useResponsiveContainer(containerQueries.up.md);
    const isXsAndDownContainer = useResponsiveContainer(containerQueries.down.xs);

    const amountLabel = i18n.get(FIELDS_KEYS['amount']);
    const columns = useTableColumns({
        customColumns,
        fields: TRANSACTION_FIELDS,
        fieldsKeys: FIELDS_KEYS,
        columnConfig: {
            amount: {
                label: hasMultipleCurrencies
                    ? undefined
                    : `${amountLabel} ${availableCurrencies && availableCurrencies[0] ? `(${getCurrencyCode(availableCurrencies[0])})` : ''}`,
                position: 'right',
                flex: isSmAndUpContainer ? 1.5 : undefined,
            },
            transactionType: { visible: isMdAndUpContainer },
            paymentMethod: { visible: isSmAndUpContainer },
        },
    });

    const EMPTY_TABLE_MESSAGE = {
        title: 'transactions.overview.errors.listEmpty',
        message: ['common.errors.updateFilters'],
    } satisfies { title: TranslationKey; message: TranslationKey | TranslationKey[] };

    const onHover = useCallback(
        (index?: number) => {
            setHoveredRow(index ?? undefined);
        },
        [setHoveredRow]
    );

    const errorDisplay = useMemo(
        () => () => (
            <DataOverviewError error={error} onContactSupport={onContactSupport} errorMessage={'transactions.overview.errors.listUnavailable'} />
        ),
        [error, onContactSupport]
    );

    return (
        <div className={BASE_CLASS}>
            <DataGrid
                autoFitColumns={isXsAndDownContainer}
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
                    // status: ({ item }) => {
                    //     return (
                    //         <Tag
                    //             label={getTransactionStatus(i18n, item.status)}
                    //             variant={getTagVariantForTransaction(item)}
                    //         />
                    //     );
                    // },
                    transactionType: ({ item, rowIndex }) => {
                        const category = getTransactionCategory(i18n, item.category);
                        if (category) {
                            const tooltip = getTransactionCategoryDescription(i18n, item.category);
                            const renderCategory = () => (
                                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                                    {category}
                                </Typography>
                            );
                            return tooltip ? (
                                <Tooltip content={tooltip} isContainerHovered={rowIndex === hoveredRow}>
                                    <span>{renderCategory()}</span>
                                </Tooltip>
                            ) : (
                                renderCategory()
                            );
                        }
                        return null;
                    },
                    amount: ({ value }) => {
                        const amount = i18n.amount(value.value, value.currency, { hideCurrency: !hasMultipleCurrencies });
                        return (
                            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} className={AMOUNT_CLASS}>
                                {amount}
                            </Typography>
                        );
                    },
                    createdAt: ({ item, value }) => {
                        if (isXsAndDownContainer) {
                            return (
                                <div className={DATE_AND_PAYMENT_METHOD_CLASS}>
                                    <PaymentMethodCell paymentMethod={item.paymentMethod} bankAccount={item.bankAccount} />

                                    <time dateTime={item.createdAt} className={DATE_METHOD_CLASS}>
                                        <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                                            {dateFormat(item.createdAt, DATE_FORMAT_TRANSACTIONS_MOBILE)}
                                        </Typography>
                                    </time>
                                </div>
                            );
                        }
                        return (
                            <time dateTime={value}>
                                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                                    {dateFormat(value, DATE_FORMAT_TRANSACTIONS)}
                                </Typography>
                            </time>
                        );
                    },
                    paymentMethod: ({ item }) => <PaymentMethodCell paymentMethod={item.paymentMethod} bankAccount={item.bankAccount} />,
                }}
            >
                {showPagination && (
                    <DataGrid.Footer>
                        <Pagination
                            {...paginationProps}
                            ariaLabelKey="transactions.overview.pagination.label"
                            limitSelectAriaLabelKey="transactions.overview.pagination.controls.limitSelect.label"
                        />
                    </DataGrid.Footer>
                )}
            </DataGrid>
        </div>
    );
};
