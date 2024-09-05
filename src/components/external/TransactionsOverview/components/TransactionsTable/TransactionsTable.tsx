import { DATE_FORMAT_TRANSACTIONS } from '../../../../internal/DataOverviewDisplay/constants';
import Category from '../Category/Category';
import DataOverviewError from '../../../../internal/DataOverviewError/DataOverviewError';
import { getLabel } from '../../../../utils/getLabel';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useTimezoneAwareDateFormatting from '../../../../hooks/useTimezoneAwareDateFormatting';
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
import { CustomColumn } from '../../../../types';

// Remove status column temporarily
// const FIELDS = ['createdAt', 'status', 'paymentMethod', 'transactionType', 'amount'] as const;

const FIELDS = ['createdAt', 'paymentMethod', 'transactionType', 'amount'] as const;
export type TransactionsTableCols = (typeof FIELDS)[number];

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
    const { dateFormat, fullDateFormat } = useTimezoneAwareDateFormatting(activeBalanceAccount?.timeZone);
    const [hoveredRow, setHoveredRow] = useState<undefined | number>();
    const isSmAndUpViewport = useResponsiveViewport(mediaQueries.up.sm);
    const isMdAndUpViewport = useResponsiveViewport(mediaQueries.up.md);
    const isXsAndDownViewport = useResponsiveViewport(mediaQueries.down.xs);

    const fieldsVisibility: Partial<Record<string, boolean>> = useMemo(
        () => ({
            transactionType: isMdAndUpViewport,
            paymentMethod: isSmAndUpViewport,
        }),
        [isSmAndUpViewport, isMdAndUpViewport]
    );

    const tableColumns: CustomColumn<TransactionsTableCols>[] = FIELDS.map(field => ({ key: field }));

    const columns = useMemo(() => {
        return (customColumns || tableColumns).map(({ key, flex }) => {
            const label = i18n.get(getLabel(key as any));
            if (key === 'amount') {
                return {
                    key: 'amount' as const,
                    label: hasMultipleCurrencies
                        ? label
                        : `${label} ${availableCurrencies && availableCurrencies[0] ? `(${getCurrencyCode(availableCurrencies[0])})` : ''}`,
                    position: key === 'amount' ? CellTextPosition.RIGHT : undefined,
                    flex: flex || (isSmAndUpViewport ? 1.5 : undefined),
                };
            }

            return { key: key as TransactionsTableCols, label, visible: fieldsVisibility[key], flex: flex };
        });
    }, [availableCurrencies, customColumns, fieldsVisibility, hasMultipleCurrencies, i18n, isSmAndUpViewport, tableColumns]);

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
                                <Category value={item.category} isContainerHovered={rowIndex === hoveredRow} />
                            ) : (
                                item.category
                            )
                        ) : null;
                    },
                    amount: ({ value }) => {
                        const amount = i18n.amount(value.value, value.currency, { hideCurrency: !hasMultipleCurrencies });
                        return <span className={AMOUNT_CLASS}>{amount}</span>;
                    },
                    createdAt: ({ item, value }) => {
                        if (isXsAndDownViewport) {
                            return (
                                <div className={DATE_AND_PAYMENT_METHOD_CLASS}>
                                    <PaymentMethodCell paymentMethod={item.paymentMethod} bankAccount={item.bankAccount} />
                                    <span className={DATE_AND_PAYMENT_METHOD_CLASS}>{dateFormat(item.createdAt, DATE_FORMAT_TRANSACTIONS)}</span>
                                </div>
                            );
                        }
                        return <span>{fullDateFormat(value)}</span>;
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
