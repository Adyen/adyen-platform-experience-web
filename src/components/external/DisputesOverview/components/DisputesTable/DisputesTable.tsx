import { FC } from 'preact/compat';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import { TranslationKey } from '../../../../../translations';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';
import Alert from '../../../../internal/Alert/Alert';
import { AlertTypeOption } from '../../../../internal/Alert/types';
import DataGrid from '../../../../internal/DataGrid';
import { DATE_FORMAT_DISPUTES, DATE_FORMAT_DISPUTES_TAG } from '../../../../../constants';
import DataOverviewError from '../../../../internal/DataOverviewError/DataOverviewError';
import Pagination from '../../../../internal/Pagination';
import { PaginationProps, WithPaginationLimitSelection } from '../../../../internal/Pagination/types';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { BASE_CLASS } from './constants';
import './DisputesTable.scss';
import { CustomColumn } from '../../../../types';
import { StringWithAutocompleteOptions } from '../../../../../utils/types';
import { useTableColumns } from '../../../../../hooks/useTableColumns';
import { IDispute, IDisputeStatusGroup } from '../../../../../types/api/models/disputes';
import PaymentMethodCell from '../../../TransactionsOverview/components/TransactionsTable/PaymentMethodCell';
import type { IBalanceAccountBase } from '../../../../../types';
import DisputeStatusTag from './DisputeStatusTag';
import { Tag } from '../../../../internal/Tag/Tag';

export const FIELDS = [
    'status',
    'respondBy',
    'createdAt',
    'paymentMethod',
    'disputeReason',
    'reason',
    'currency',
    'disputedAmount',
    'totalPaymentAmount',
] as const;
export type DisputesTableFields = (typeof FIELDS)[number];

export interface DisputesTableProps extends WithPaginationLimitSelection<PaginationProps> {
    balanceAccountId: string | undefined;
    loading: boolean;
    error?: AdyenPlatformExperienceError;
    onContactSupport?: () => void;
    showPagination: boolean;
    data: IDispute[] | undefined;
    activeBalanceAccount?: IBalanceAccountBase;
    onRowClick: (value: IDispute) => void;
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
    const { dateFormat } = useTimezoneAwareDateFormatting(activeBalanceAccount?.timeZone);
    const [alert, setAlert] = useState<null | { title: string; description: string }>(null);
    const { refreshing } = useConfigContext();
    const isLoading = useMemo(() => loading || refreshing, [loading, refreshing]);

    const columns = useTableColumns({
        fields: FIELDS,
        fieldsKeys: {
            status: 'disputes.status',
            disputedAmount: 'disputes.disputedAmount',
            disputeReason: 'disputes.disputeReason',
            reason: 'disputes.reason',
            paymentMethod: 'disputes.paymentMethod',
            createdAt: 'disputes.openedOn',
            respondBy: 'disputes.respondBy',
            currency: 'disputes.currency',
            totalPaymentAmount: 'disputes.totalPaymentAmount',
        },
        customColumns,
        columnConfig: useMemo(
            () => ({
                status: {
                    visible: statusGroup === 'ONGOING_AND_CLOSED',
                },
                amount: {
                    position: 'right',
                },
                disputedAmount: {
                    visible: statusGroup === 'CHARGEBACKS' || statusGroup === 'ONGOING_AND_CLOSED',
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

    const removeAlert = useCallback(() => {
        setAlert(null);
    }, []);

    const EMPTY_TABLE_MESSAGE = {
        title: 'noReportsFound',
        message: ['tryDifferentSearchOrResetYourFiltersAndWeWillTryAgain'],
    } satisfies { title: TranslationKey; message: TranslationKey | TranslationKey[] };

    const errorDisplay = useMemo(
        () => () => <DataOverviewError error={error} errorMessage={'weCouldNotLoadYourReports'} onContactSupport={onContactSupport} />,
        [error, onContactSupport]
    );

    if (loading) setAlert(null);

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
                    status: ({ value, item }) => {
                        return <DisputeStatusTag dispute={item}>{value}</DisputeStatusTag>;
                    },
                    reason: ({ item }) => {
                        return item.reason.title;
                    },
                    respondBy: ({ item }) => {
                        return (
                            <DisputeStatusTag type={'text'} dispute={item}>
                                {dateFormat(item.createdAt, DATE_FORMAT_DISPUTES_TAG)}
                            </DisputeStatusTag>
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
                        if (!value) return null;
                        return value && <Typography variant={TypographyVariant.BODY}>{dateFormat(value, DATE_FORMAT_DISPUTES)}</Typography>;
                    },
                    paymentMethod: ({ item }) => <PaymentMethodCell paymentMethod={item.paymentMethod} />,
                    disputeReason: ({ item }) => <span>{i18n.get(`disputes.${item.reason.category}`)}</span>,
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
