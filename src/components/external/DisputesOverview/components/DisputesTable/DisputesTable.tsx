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
import { isDisputeActionNeededUrgently } from '../../../../utils/disputes/actionNeeded';
import { DISPUTE_REASON_CATEGORIES } from '../../../../utils/disputes/constants';
import { DATE_FORMAT_DISPUTES } from '../../../../../constants';
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
import { Translation } from '../../../../internal/Translation';
import './DisputesTable.scss';

export type DisputesTableFields = keyof typeof FIELD_KEYS;

export const FIELD_KEYS = {
    status: 'disputes.status',
    respondBy: 'disputes.respondBy',
    createdAt: 'disputes.openedOn',
    paymentMethod: 'disputes.paymentMethod',
    disputeReason: 'disputes.disputeReason',
    reason: 'disputes.reason',
    currency: 'disputes.currency',
    disputedAmount: 'disputes.disputedAmount',
    totalPaymentAmount: 'disputes.totalPaymentAmount',
} as const satisfies Record<string, TranslationKey>;

export const EMPTY_TABLE_MESSAGE_KEYS = {
    CHARGEBACKS: { title: 'disputes.empty.noChargebacksFound', message: 'disputes.empty.tryDifferentSearchOrCheckAgainLaterForNewChargebacks' },
    FRAUD_ALERTS: { title: 'disputes.empty.noFraudAlertsFound', message: 'disputes.empty.tryDifferentSearchOrCheckAgainLaterForNewFraudAlerts' },
    ONGOING_AND_CLOSED: { title: 'disputes.empty.noDisputesFound', message: 'disputes.empty.tryDifferentSearchOrCheckAgainLaterForNewDisputes' },
} as const satisfies Record<IDisputeStatusGroup, { title: TranslationKey; message: TranslationKey }>;

export const FIELDS = Object.keys(FIELD_KEYS) as readonly DisputesTableFields[];

const classes = {
    cellContent: `${BASE_CLASS}__cell-content`,
    cellContentVStack: `${BASE_CLASS}__cell-content--vstack`,
    cellTextGrey: `${BASE_CLASS}__cell-text--grey`,
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
                limitSelectAriaLabelKey = 'disputes.pagination.chargebacks.limitSelector.label';
                break;
            case 'FRAUD_ALERTS':
                limitSelectAriaLabelKey = 'disputes.pagination.fraudAlerts.limitSelector.label';
                break;
            case 'ONGOING_AND_CLOSED':
                limitSelectAriaLabelKey = 'disputes.pagination.ongoingAndClosed.limitSelector.label';
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

    const EMPTY_TABLE_MESSAGE = {
        title: EMPTY_TABLE_MESSAGE_KEYS[statusGroup].title,
        message: [EMPTY_TABLE_MESSAGE_KEYS[statusGroup].message],
    } satisfies { title: TranslationKey; message: TranslationKey | TranslationKey[] };

    const errorDisplay = useMemo(
        () => () => (
            <DataOverviewError error={error} errorMessage={'disputes.error.weCouldNotLoadYourDisputes'} onContactSupport={onContactSupport} />
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
                        const renderDueDate = () => (
                            <>
                                <time dateTime={item.dueDate!}>{dateFormat(item.dueDate!, DATE_FORMAT_DISPUTES)}</time>
                                {isUrgent && <Icon name={'warning-filled'} />}
                            </>
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
                                            <Translation translationKey="disputes.gridCell.dueDate" fills={{ dueDate: renderDueDate }} />
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
                        <Pagination {...paginationProps} ariaLabelKey="disputes.pagination" limitSelectAriaLabelKey={limitSelectAriaLabelKey} />
                    </DataGrid.Footer>
                )}
            </DataGrid>
        </div>
    );
};
