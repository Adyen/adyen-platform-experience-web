import { FC } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import useTimezoneAwareDateFormatting from '../../../../hooks/useTimezoneAwareDateFormatting';
import { containerQueries, useResponsiveContainer } from '../../../../hooks/useResponsiveContainer';
import { useTableColumns } from '../../../../hooks/useTableColumns';
import { TranslationKey } from '../../../../translations';
import DataOverviewError from '../../../internal/DataOverviewError';
import DataGrid from '../../../internal/DataGrid';
import Pagination from '../../../internal/Pagination';
import { PayByLinkTableProps } from './types';
import { BASE_TABLE_GRID_CLASS } from './constants';
import { Tag } from '../../../internal/Tag/Tag';
import { TagVariant } from '../../../internal/Tag/types';
import Typography from '../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../internal/Typography/types';
import { AMOUNT_CLASS } from '../../TransactionsOverview/components/TransactionsTable/constants';
import { IPayByLinkStatus } from '../../../../types';
import { DATE_FORMAT_PAY_BY_LINK, DATE_FORMAT_PAY_BY_LINK_EXPIRE_DATE } from '../../../../constants/dateFormats';

const getTagVariantForStatus = (status: IPayByLinkStatus) => {
    switch (status) {
        case 'COMPLETED':
            return TagVariant.SUCCESS;
        case 'EXPIRED':
            return TagVariant.DEFAULT;
        case 'PAYMENT_PENDING':
            return TagVariant.WARNING;
        case 'ACTIVE':
            return TagVariant.BLUE;
        default:
            return TagVariant.DEFAULT;
    }
};

export const PAY_BY_LINK_TABLE_FIELDS = [
    'id',
    'amount',
    'currency',
    'status',
    'expirationDate',
    'creationDate',
    'reusable',
    'merchantReference',
    'shopperEmail',
] as const;

const FIELDS_KEYS = {
    id: 'payByLink.overview.common.fields.id',
    amount: 'payByLink.overview.common.fields.amount',
    currency: 'payByLink.overview.common.fields.currency',
    status: 'payByLink.overview.common.fields.status',
    expirationDate: 'payByLink.overview.common.fields.expirationDate',
    creationDate: 'payByLink.overview.common.fields.createdAt',
    reusable: 'payByLink.overview.common.fields.linkType',
    merchantReference: 'payByLink.overview.common.fields.merchantReference',
    shopperEmail: 'payByLink.overview.common.fields.shopperEmail',
} as const satisfies Record<string, TranslationKey>;

export const PayByLinkTable: FC<PayByLinkTableProps> = ({
    availableCurrencies,
    error,
    hasMultipleCurrencies,
    loading,
    onContactSupport,
    onRowClick,
    showDetails,
    showPagination,
    paymentLinks,
    ...paginationProps
}) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting();
    const isSmAndUpContainer = useResponsiveContainer(containerQueries.up.sm);

    const columns = useTableColumns({
        fields: PAY_BY_LINK_TABLE_FIELDS,
        fieldsKeys: FIELDS_KEYS,
        columnConfig: {
            amount: {
                position: 'right',
                flex: isSmAndUpContainer ? 1.5 : undefined,
            },
            reusable: {
                label: i18n.get(FIELDS_KEYS.reusable),
            },
        },
    });

    const EMPTY_TABLE_MESSAGE = {
        title: 'transactions.overview.errors.listEmpty',
        message: ['common.errors.updateFilters'],
    } satisfies { title: TranslationKey; message: TranslationKey | TranslationKey[] };

    const errorDisplay = useMemo(
        () => () => (
            <DataOverviewError error={error} onContactSupport={onContactSupport} errorMessage={'transactions.overview.errors.listUnavailable'} />
        ),
        [error, onContactSupport]
    );

    return (
        <div className={BASE_TABLE_GRID_CLASS}>
            <DataGrid
                errorDisplay={errorDisplay}
                error={error}
                columns={columns}
                data={paymentLinks}
                loading={loading}
                outline={false}
                onRowClick={{ callback: onRowClick }}
                emptyTableMessage={EMPTY_TABLE_MESSAGE}
                customCells={{
                    currency: ({ item }) => {
                        if (!item?.amount?.currency) return;
                        return <Tag label={`${item.amount.currency}`} variant={TagVariant.DEFAULT} />;
                    },
                    amount: ({ value }) => {
                        const amount = i18n.amount(value.value, value.currency, { hideCurrency: true });
                        return (
                            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} className={AMOUNT_CLASS}>
                                {amount}
                            </Typography>
                        );
                    },
                    status: ({ value }) => {
                        if (!value) return;
                        return <Tag label={i18n.get(`payByLink.common.status.${value}`)} variant={getTagVariantForStatus(value)} />;
                    },
                    reusable: ({ item }) => {
                        const value = item?.reusable ? 'payByLink.common.linkType.open' : 'payByLink.common.linkType.singleUse';
                        if (!value) return;
                        return (
                            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                                {i18n.get(value)}
                            </Typography>
                        );
                    },
                    creationDate: ({ value }) => {
                        return (
                            <time dateTime={value}>
                                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                                    {dateFormat(value, DATE_FORMAT_PAY_BY_LINK)}
                                </Typography>
                            </time>
                        );
                    },
                    expirationDate: ({ value }) => {
                        return (
                            <time dateTime={value}>
                                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                                    {dateFormat(value, DATE_FORMAT_PAY_BY_LINK_EXPIRE_DATE)}
                                </Typography>
                            </time>
                        );
                    },
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
