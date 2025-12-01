import { FC } from 'preact/compat';
import { useCallback, useMemo } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import useTimezoneAwareDateFormatting from '../../../../hooks/useTimezoneAwareDateFormatting';
import { containerQueries, useResponsiveContainer } from '../../../../hooks/useResponsiveContainer';
import { useTableColumns } from '../../../../hooks/useTableColumns';
import { TranslationKey } from '../../../../translations';
import DataOverviewError from '../../../internal/DataOverviewError';
import DataGrid from '../../../internal/DataGrid';
import Pagination from '../../../internal/Pagination';
import { PayByLinkTableProps } from './types';
import { BASE_TABLE_GRID_CLASS, PAY_BY_LINK_STATUSES } from './constants';
import { Tag } from '../../../internal/Tag/Tag';
import { TagVariant } from '../../../internal/Tag/types';
import Typography from '../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../internal/Typography/types';
import { IPayByLinkStatus } from '../../../../types';
import { DATE_FORMAT_PAY_BY_LINK, DATE_FORMAT_PAY_BY_LINK_EXPIRE_DATE, DATE_FORMAT_RESPONSE_DEADLINE } from '../../../../constants/dateFormats';
import { DAY_MS } from '../../../internal/Calendar/calendar/constants';
import { Tooltip } from '../../../internal/Tooltip/Tooltip';
import Icon from '../../../internal/Icon';
import { isActionNeededUrgently } from '../../../utils/payByLink/actionLevel';

const getTagVariantForStatus = (status: IPayByLinkStatus) => {
    switch (status) {
        case 'completed':
            return TagVariant.SUCCESS;
        case 'expired':
            return TagVariant.DEFAULT;
        case 'paymentPending':
            return TagVariant.WARNING;
        case 'active':
            return TagVariant.BLUE;
        default:
            return TagVariant.DEFAULT;
    }
};

export const PAY_BY_LINK_TABLE_FIELDS = [
    'paymentLinkId',
    'merchantReference',
    'currency',
    'amount',
    'status',
    'expirationDate',
    'creationDate',
    'linkType',
    'shopperEmail',
] as const;

const FIELDS_KEYS = {
    paymentLinkId: 'payByLink.overview.common.fields.id',
    amount: 'payByLink.overview.common.fields.amount',
    currency: 'payByLink.overview.common.fields.currency',
    status: 'payByLink.overview.common.fields.status',
    expirationDate: 'payByLink.overview.common.fields.expirationDate',
    creationDate: 'payByLink.overview.common.fields.createdAt',
    linkType: 'payByLink.overview.common.fields.linkType',
    merchantReference: 'payByLink.overview.common.fields.merchantReference',
    shopperEmail: 'payByLink.overview.common.fields.shopperEmail',
} as const satisfies Record<string, TranslationKey>;

export const PayByLinkTable: FC<PayByLinkTableProps> = ({
    error,
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

    const getTimeToDeadline = useCallback(
        (dueDate: string) => {
            if (!dueDate) return '';
            const deadline = new Date(dueDate).getTime();
            const diffInMs = deadline - Date.now();
            const diffInDays = Math.ceil(diffInMs / DAY_MS);
            const formattedDate = dateFormat(dueDate, { ...DATE_FORMAT_RESPONSE_DEADLINE, weekday: undefined });

            return diffInDays <= 1
                ? i18n.get('payByLink.overview.common.actionNeeded.respondToday', { values: { date: formattedDate } })
                : i18n.get('payByLink.overview.common.actionNeeded.respondDays', { values: { days: diffInDays, date: formattedDate } });
        },
        [dateFormat, i18n]
    );

    const columns = useTableColumns({
        fields: PAY_BY_LINK_TABLE_FIELDS,
        fieldsKeys: FIELDS_KEYS,
        columnConfig: {
            amount: {
                position: 'right',
                flex: isSmAndUpContainer ? 1.5 : undefined,
            },
            linkType: {
                label: i18n.get(FIELDS_KEYS.linkType),
            },
        },
    });

    const EMPTY_TABLE_MESSAGE = {
        title: 'payByLink.overview.errors.listEmpty',
        message: ['common.errors.updateFilters'],
    } satisfies { title: TranslationKey; message: TranslationKey | TranslationKey[] };

    const errorDisplay = useMemo(
        () => () => (
            <DataOverviewError error={error} onContactSupport={onContactSupport} errorMessage={'payByLink.overview.errors.listUnavailable'} />
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
                            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                                {amount}
                            </Typography>
                        );
                    },
                    status: ({ value }) => {
                        if (!value) return;
                        return <Tag label={i18n.get(`${PAY_BY_LINK_STATUSES[value]}`)} variant={getTagVariantForStatus(value)} />;
                    },
                    linkType: ({ item }) => {
                        const value = item?.linkType === 'open' ? 'payByLink.common.linkType.open' : 'payByLink.common.linkType.singleUse';
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
                        const isUrgent = isActionNeededUrgently(value);

                        return isUrgent ? (
                            <Tooltip content={getTimeToDeadline(value!)}>
                                <span>
                                    <time dateTime={value!}>{dateFormat(value, DATE_FORMAT_PAY_BY_LINK_EXPIRE_DATE)}</time>
                                </span>
                            </Tooltip>
                        ) : (
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
                            ariaLabelKey="payByLink.overview.pagination.label"
                            limitSelectAriaLabelKey="payByLink.overview.pagination.controls.limitSelect.label"
                        />
                    </DataGrid.Footer>
                )}
            </DataGrid>
        </div>
    );
};
