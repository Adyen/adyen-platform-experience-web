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
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { BASE_CLASS } from './constants';
import { CustomColumn } from '../../../../types';
import { StringWithAutocompleteOptions } from '../../../../../utils/types';
import { useTableColumns } from '../../../../../hooks/useTableColumns';
import { IDisputeListItem, IDisputeStatusGroup } from '../../../../../types/api/models/disputes';
import PaymentMethodCell from '../../../TransactionsOverview/components/TransactionsTable/PaymentMethodCell';
import type { IBalanceAccountBase } from '../../../../../types';
import DisputeStatusTag from './DisputeStatusTag';
import { Tag } from '../../../../internal/Tag/Tag';
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

export const FIELDS = Object.keys(FIELD_KEYS) as readonly DisputesTableFields[];

const classes = {
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

    const columns = useTableColumns({
        fields: FIELDS,
        fieldsKeys: FIELD_KEYS,
        customColumns,
        columnConfig: useMemo(
            () => ({
                status: {
                    visible: statusGroup === 'ONGOING_AND_CLOSED',
                },
                disputedAmount: {
                    visible: statusGroup === 'CHARGEBACKS' || statusGroup === 'ONGOING_AND_CLOSED',
                    position: 'right',
                },
                disputeReason: {
                    visible: statusGroup === 'CHARGEBACKS' || statusGroup === 'ONGOING_AND_CLOSED',
                },
                respondBy: {
                    visible: statusGroup === 'CHARGEBACKS',
                },
                reason: {
                    visible: statusGroup === 'FRAUD_ALERTS',
                    flex: 2,
                },
                currency: {
                    flex: 0.5,
                },
                totalPaymentAmount: {
                    visible: statusGroup === 'FRAUD_ALERTS',
                    position: 'right',
                },
            }),
            [statusGroup]
        ),
    });

    const removeAlert = useCallback(() => setAlert(null), []);

    const EMPTY_TABLE_MESSAGE = {
        title: 'noReportsFound',
        message: ['tryDifferentSearchOrResetYourFiltersAndWeWillTryAgain'],
    } satisfies { title: TranslationKey; message: TranslationKey | TranslationKey[] };

    const errorDisplay = useMemo(
        () => () => <DataOverviewError error={error} errorMessage={'disputes.weCouldNotLoadYourDisputes'} onContactSupport={onContactSupport} />,
        [error, onContactSupport]
    );

    useEffect(() => {
        if (isLoading) removeAlert();
    }, [isLoading, removeAlert]);

    return (
        <div className={BASE_CLASS}>
            {alert && <Alert onClose={removeAlert} type={AlertTypeOption.WARNING} className={'adyen-pe-disputes-table-alert'} {...alert} />}
            <DataGrid
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
                        return <DisputeStatusTag dispute={item} />;
                    },
                    reason: ({ item }) => {
                        return item.reason.title;
                    },
                    respondBy: ({ item }) => {
                        if (!item.dueDate) return null;
                        const isUrgent = isDisputeActionNeededUrgently(item);
                        return (
                            <Typography
                                variant={TypographyVariant.BODY}
                                className={cx(classes.statusContent, { [classes.statusContentUrgent]: isUrgent })}
                            >
                                {dateFormat(item.dueDate, DATE_FORMAT_DISPUTES)}
                                {isUrgent && <Icon name={'warning-filled'} />}
                            </Typography>
                        );
                    },
                    currency: ({ item }) => {
                        return <Tag>{item.amount.currency}</Tag>;
                    },
                    disputedAmount: ({ item }) => {
                        return (
                            item.amount && (
                                <Typography variant={TypographyVariant.BODY} stronger>
                                    {i18n.amount(item.amount.value, item.amount.currency, { hideCurrency: false })}
                                </Typography>
                            )
                        );
                    },
                    createdAt: ({ value }) => {
                        return <Typography variant={TypographyVariant.BODY}>{dateFormat(value, DATE_FORMAT_DISPUTES)}</Typography>;
                    },
                    paymentMethod: ({ item }) => <PaymentMethodCell paymentMethod={item.paymentMethod} />,
                    disputeReason: ({ item }) => <span>{i18n.get(DISPUTE_REASON_CATEGORIES[item.reason.category])}</span>,
                    totalPaymentAmount: ({ item }) => {
                        return (
                            item && (
                                <Typography variant={TypographyVariant.BODY} stronger>
                                    {i18n.amount(item.amount.value, item.amount.currency, { hideCurrency: false })}
                                </Typography>
                            )
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
