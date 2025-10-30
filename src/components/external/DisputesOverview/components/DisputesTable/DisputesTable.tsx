import cx from 'classnames';
import { FC } from 'preact/compat';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import { TranslationKey } from '../../../../../translations';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';
import Alert from '../../../../internal/Alert/Alert';
import Icon from '../../../../internal/Icon';
import { AlertTypeOption } from '../../../../internal/Alert/types';
import DataGrid from '../../../../internal/DataGrid';
import { DAY_MS } from '../../../../internal/Calendar/calendar/constants';
import { isDisputeActionNeededUrgently } from '../../../../utils/disputes/actionNeeded';
import { DISPUTE_REASON_CATEGORIES } from '../../../../utils/disputes/constants';
import { DATE_FORMAT_DISPUTES, DATE_FORMAT_RESPONSE_DEADLINE } from '../../../../../constants';
import DataOverviewError from '../../../../internal/DataOverviewError/DataOverviewError';
import Pagination from '../../../../internal/Pagination';
import { PaginationProps, WithPaginationLimitSelection } from '../../../../internal/Pagination/types';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { BASE_CLASS } from './constants';
import { CustomColumn } from '../../../../types';
import { StringWithAutocompleteOptions } from '../../../../../utils/types';
import { useTableColumns } from '../../../../../hooks/useTableColumns';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import { IDisputeListItem, IDisputeStatusGroup } from '../../../../../types/api/models/disputes';
import PaymentMethodCell from '../../../TransactionsOverview/components/TransactionsTable/PaymentMethodCell';
import type { IBalanceAccountBase } from '../../../../../types';
import DisputeStatusTag from './DisputeStatusTag';
import { Tag } from '../../../../internal/Tag/Tag';
import { Tooltip } from '../../../../internal/Tooltip/Tooltip';
import { Translation } from '../../../../internal/Translation';
import './DisputesTable.scss';

export type DisputesTableFields = keyof typeof FIELD_KEYS;

export const FIELD_KEYS = {
    status: 'disputes.overview.common.fields.status',
    respondBy: 'disputes.overview.common.fields.respondBy',
    createdAt: 'disputes.overview.common.fields.openedOn',
    paymentMethod: 'disputes.overview.common.fields.paymentMethod',
    disputeReason: 'disputes.overview.common.fields.disputeReason',
    reason: 'disputes.overview.common.fields.reason',
    currency: 'disputes.overview.common.fields.currency',
    disputedAmount: 'disputes.overview.common.fields.disputedAmount',
    totalPaymentAmount: 'disputes.overview.common.fields.totalPaymentAmount',
} as const satisfies Record<string, TranslationKey>;

export const EMPTY_TABLE_MESSAGE_KEYS = {
    CHARGEBACKS: { title: 'disputes.overview.chargebacks.errors.listEmpty', message: 'disputes.overview.chargebacks.errors.updateFilters' },
    FRAUD_ALERTS: { title: 'disputes.overview.fraudAlerts.errors.listEmpty', message: 'disputes.overview.fraudAlerts.errors.updateFilters' },
    ONGOING_AND_CLOSED: {
        title: 'disputes.overview.ongoingAndClosed.errors.listEmpty',
        message: 'disputes.overview.ongoingAndClosed.errors.updateFilters',
    },
} as const satisfies Record<IDisputeStatusGroup, { title: TranslationKey; message: TranslationKey }>;

export const FIELDS = Object.keys(FIELD_KEYS) as readonly DisputesTableFields[];

const classes = {
    cellContent: `${BASE_CLASS}__cell-content`,
    cellContentVStack: `${BASE_CLASS}__cell-content--vstack`,
    cellTextGrey: `${BASE_CLASS}__cell-text--grey`,
    dateContentUrgent: `${BASE_CLASS}__date-content--urgent`,
    statusContent: `${BASE_CLASS}__status-content`,
    statusContentUrgent: `${BASE_CLASS}__status-content--urgent`,
};

export interface DisputesTableProps extends WithPaginationLimitSelection<PaginationProps> {
    balanceAccountId: string | undefined;
    loading: boolean;
    error?: AdyenPlatformExperienceError;
    onContactSupport?: () => void;
    showPagination: boolean;
    data: IDisputeListItem[] | undefined;
    activeBalanceAccount?: IBalanceAccountBase;
    onRowClick: (value: IDisputeListItem) => void;
    customColumns?: CustomColumn<StringWithAutocompleteOptions<DisputesTableFields>>[];
    statusGroup: IDisputeStatusGroup;
}

export const DisputesTable: FC<DisputesTableProps> = ({
    error,
    loading,
    balanceAccountId,
    onContactSupport,
    showPagination,
    onRowClick,
    data,
    customColumns,
    activeBalanceAccount,
    statusGroup,
    ...paginationProps
}) => {
    const { i18n } = useCoreContext();
    const { refreshing } = useConfigContext();
    const { dateFormat } = useTimezoneAwareDateFormatting(activeBalanceAccount?.timeZone);

    const [alert, setAlert] = useState<null | { title: string; description: string }>(null);
    const isLoading = useMemo(() => loading || refreshing, [loading, refreshing]);
    const isMobileContainer = useResponsiveContainer(containerQueries.down.xs);

    let limitSelectAriaLabelKey: TranslationKey | undefined = undefined;

    if (showPagination) {
        switch (statusGroup) {
            case 'CHARGEBACKS':
                limitSelectAriaLabelKey = 'disputes.overview.chargebacks.limitSelect.a11y.label';
                break;
            case 'FRAUD_ALERTS':
                limitSelectAriaLabelKey = 'disputes.overview.fraudAlerts.limitSelect.a11y.label';
                break;
            case 'ONGOING_AND_CLOSED':
                limitSelectAriaLabelKey = 'disputes.overview.ongoingAndClosed.limitSelect.a11y.label';
                break;
        }
    }

    const columns = useTableColumns({
        fields: FIELDS,
        fieldsKeys: FIELD_KEYS,
        customColumns,
        columnConfig: useMemo(
            () => ({
                status: {
                    visible: statusGroup === 'ONGOING_AND_CLOSED',
                },
                reason: {
                    visible: statusGroup === 'FRAUD_ALERTS' && !isMobileContainer,
                    flex: 2,
                },
                respondBy: {
                    visible: statusGroup === 'CHARGEBACKS',
                },
                currency: {
                    visible: !isMobileContainer,
                    flex: 0.5,
                },
                disputedAmount: {
                    visible: statusGroup !== 'FRAUD_ALERTS',
                    position: 'right',
                },
                createdAt: {
                    visible: !isMobileContainer || statusGroup === 'FRAUD_ALERTS',
                },
                paymentMethod: {
                    visible: !isMobileContainer,
                },
                disputeReason: {
                    visible: statusGroup !== 'FRAUD_ALERTS' && !isMobileContainer,
                },
                totalPaymentAmount: {
                    visible: statusGroup === 'FRAUD_ALERTS',
                    position: 'right',
                },
            }),
            [isMobileContainer, statusGroup]
        ),
    });

    const removeAlert = useCallback(() => setAlert(null), []);

    const getTimeToDeadline = useCallback(
        (dueDate: string) => {
            if (!dueDate) return '';
            const deadline = new Date(dueDate).getTime();
            const diffInMs = deadline - Date.now();
            const diffInDays = Math.ceil(diffInMs / DAY_MS);
            const formattedDate = dateFormat(dueDate, { ...DATE_FORMAT_RESPONSE_DEADLINE, weekday: undefined });

            return diffInDays <= 1
                ? i18n.get('disputes.overview.common.actionNeeded.respondToday', { values: { date: formattedDate } })
                : i18n.get('disputes.overview.common.actionNeeded.respondDays', { values: { days: diffInDays, date: formattedDate } });
        },
        [dateFormat, i18n]
    );

    const EMPTY_TABLE_MESSAGE = {
        title: EMPTY_TABLE_MESSAGE_KEYS[statusGroup].title,
        message: [EMPTY_TABLE_MESSAGE_KEYS[statusGroup].message],
    } satisfies { title: TranslationKey; message: TranslationKey | TranslationKey[] };

    const errorDisplay = useMemo(
        () => () => (
            <DataOverviewError error={error} errorMessage={'disputes.overview.common.errors.listUnavailable'} onContactSupport={onContactSupport} />
        ),
        [error, onContactSupport]
    );

    useEffect(() => {
        if (isLoading) removeAlert();
    }, [isLoading, removeAlert]);

    return (
        <div className={BASE_CLASS}>
            {alert && <Alert onClose={removeAlert} type={AlertTypeOption.WARNING} className={'adyen-pe-disputes-table-alert'} {...alert} />}
            <DataGrid
                autoFitColumns={isMobileContainer}
                errorDisplay={errorDisplay}
                error={error}
                columns={columns}
                data={data}
                loading={isLoading}
                outline={false}
                onRowClick={{ callback: onRowClick }}
                emptyTableMessage={EMPTY_TABLE_MESSAGE}
                customCells={{
                    status: ({ item }) => {
                        return (
                            <div className={cx(classes.cellContent, { [classes.cellContentVStack]: isMobileContainer })}>
                                <DisputeStatusTag dispute={item} />
                                {isMobileContainer && <PaymentMethodCell paymentMethod={item.paymentMethod} />}
                            </div>
                        );
                    },
                    reason: ({ item }) => {
                        return item.reason.title;
                    },
                    respondBy: ({ item }) => {
                        const isUrgent = isDisputeActionNeededUrgently(item);
                        const formattedDate = dateFormat(item.dueDate!, DATE_FORMAT_DISPUTES);
                        // TODO - Check if the API can send the defensibility field in a next iteration
                        const isActionableDispute = true; /* isDisputeActionNeeded(item) && item.defensibility !== 'NOT_ACTIONABLE' */

                        const renderDueDate = () =>
                            isUrgent && isActionableDispute ? (
                                <Tooltip content={getTimeToDeadline(item.dueDate!)}>
                                    <span className={classes.dateContentUrgent}>
                                        <time dateTime={item.dueDate!}>{formattedDate}</time>
                                        {<Icon name={'warning-filled'} />}
                                    </span>
                                </Tooltip>
                            ) : (
                                <time dateTime={item.dueDate!}>{formattedDate}</time>
                            );

                        return (
                            <div className={cx(classes.cellContent, { [classes.cellContentVStack]: isMobileContainer })}>
                                {item.dueDate ? (
                                    <Typography
                                        el={TypographyElement.SPAN}
                                        variant={TypographyVariant.BODY}
                                        className={cx(classes.statusContent, {
                                            [classes.cellTextGrey]: isMobileContainer && !isUrgent,
                                            [classes.statusContentUrgent]: isUrgent,
                                        })}
                                    >
                                        {isMobileContainer ? (
                                            <Translation
                                                translationKey="disputes.overview.common.actionNeeded.dueDate"
                                                fills={{ dueDate: renderDueDate }}
                                            />
                                        ) : (
                                            renderDueDate()
                                        )}
                                    </Typography>
                                ) : null}
                                {isMobileContainer && <PaymentMethodCell paymentMethod={item.paymentMethod} />}
                            </div>
                        );
                    },
                    currency: ({ item }) => {
                        return <Tag>{item.amount.currency}</Tag>;
                    },
                    disputedAmount: ({ item }) => {
                        return (
                            item.amount && (
                                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                                    {i18n.amount(item.amount.value, item.amount.currency, { hideCurrency: false })}
                                </Typography>
                            )
                        );
                    },
                    createdAt: ({ item }) => {
                        return (
                            <div className={cx(classes.cellContent, { [classes.cellContentVStack]: isMobileContainer })}>
                                <time
                                    dateTime={item.createdAt}
                                    className={cx(classes.statusContent, {
                                        [classes.cellTextGrey]: isMobileContainer,
                                    })}
                                >
                                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                                        {dateFormat(item.createdAt, DATE_FORMAT_DISPUTES)}
                                    </Typography>
                                </time>
                                {isMobileContainer && <PaymentMethodCell paymentMethod={item.paymentMethod} />}
                            </div>
                        );
                    },
                    paymentMethod: ({ item }) => <PaymentMethodCell paymentMethod={item.paymentMethod} />,
                    disputeReason: ({ item }) => <span>{i18n.get(DISPUTE_REASON_CATEGORIES[item.reason.category])}</span>,
                    totalPaymentAmount: ({ item }) => {
                        return (
                            item && (
                                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                                    {i18n.amount(item.amount.value, item.amount.currency, { hideCurrency: false })}
                                </Typography>
                            )
                        );
                    },
                }}
            >
                {showPagination && (
                    <DataGrid.Footer>
                        <Pagination
                            {...paginationProps}
                            ariaLabelKey="disputes.overview.common.pagination.a11y.label"
                            limitSelectAriaLabelKey={limitSelectAriaLabelKey}
                        />
                    </DataGrid.Footer>
                )}
            </DataGrid>
        </div>
    );
};
