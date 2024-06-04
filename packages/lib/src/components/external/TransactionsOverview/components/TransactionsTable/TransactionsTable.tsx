import Category from '../Category/Category';
import DataOverviewError from '../../../../internal/DataOverviewError/DataOverviewError';
import { getLabel } from '../../../../utils/getLabel';
import { useAuthContext } from '../../../../../core/Auth';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useCallback, useMemo, useState } from 'preact/hooks';
import DataGrid from '../../../../internal/DataGrid';
import Pagination from '../../../../internal/Pagination';
import { parsePaymentMethodType } from '../utils';
import { Tag } from '../../../../internal/Tag/Tag';
import { TagVariant } from '../../../../internal/Tag/types';
import { CellTextPosition } from '../../../../internal/DataGrid/types';
import { Image } from '../../../../internal/Image/Image';
import { TranslationKey } from '../../../../../core/Localization/types';
import { getCurrencyCode } from '../../../../../core/Localization/amount/amount-util';
import { AMOUNT_CLASS, BASE_CLASS, PAYMENT_METHOD_CLASS, PAYMENT_METHOD_LOGO_CLASS, PAYMENT_METHOD_LOGO_CONTAINER_CLASS } from './constants';
import './TransactionTable.scss';
import { mediaQueries, useResponsiveViewport } from '../../hooks/useResponsiveViewport';
import { FC } from 'preact/compat';
import { TransactionTableProps } from './types';

// Remove status column temporarily
// const FIELDS = ['createdAt', 'status', 'paymentMethod', 'transactionType', 'amount'] as const;
const FIELDS = ['createdAt', 'paymentMethod', 'transactionType', 'amount'] as const;
type FieldsType = (typeof FIELDS)[number];

export const TransactionsTable: FC<TransactionTableProps> = ({
    availableCurrencies,
    error,
    hasMultipleCurrencies,
    loading,
    onContactSupport,
    onRowClick,
    onTransactionSelected,
    showDetails,
    showPagination,
    transactions,
    ...paginationProps
}) => {
    const { i18n } = useCoreContext();
    const { refreshing } = useAuthContext();
    const [hoveredRow, setHoveredRow] = useState<undefined | number>();
    const isLoading = useMemo(() => loading || refreshing, [loading, refreshing]);
    const isSmViewport = useResponsiveViewport(mediaQueries.down.sm);

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
                    };
                }

                return { key, label };
            }).filter(column => {
                // Remove status column temporarily
                // const fieldsHiddenInSmViewport: FieldsType[] = ['status', 'transactionType'];
                const fieldsHiddenInSmViewport: FieldsType[] = ['transactionType'];
                return !(isSmViewport && fieldsHiddenInSmViewport.includes(column.key));
            }),
        [availableCurrencies, hasMultipleCurrencies, i18n, isSmViewport]
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
                loading={isLoading}
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
                                <span>{item.category}</span>
                            )
                        ) : null;
                    },
                    createdAt: ({ value }) => i18n.fullDate(value),
                    amount: ({ value }) => {
                        const amount = i18n.amount(value.value, value.currency, { hideCurrency: !hasMultipleCurrencies });
                        return <span className={AMOUNT_CLASS}>{amount}</span>;
                    },
                    paymentMethod: ({ item }) => {
                        return (
                            <>
                                {item.paymentMethod || item.bankAccount ? (
                                    <div className={PAYMENT_METHOD_CLASS}>
                                        <div className={PAYMENT_METHOD_LOGO_CONTAINER_CLASS}>
                                            <Image
                                                name={item.paymentMethod ? item.paymentMethod.type : 'bankTransfer'}
                                                alt={item.paymentMethod ? item.paymentMethod.type : 'bankTransfer'}
                                                folder={'logos/'}
                                                className={PAYMENT_METHOD_LOGO_CLASS}
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
