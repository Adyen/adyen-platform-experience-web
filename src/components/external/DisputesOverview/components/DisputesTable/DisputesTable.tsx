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
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import { BASE_CLASS } from './constants';
import './DisputesTable.scss';
import { CustomColumn } from '../../../../types';
import { StringWithAutocompleteOptions } from '../../../../../utils/types';
import { useTableColumns } from '../../../../../hooks/useTableColumns';
import { IDispute } from '../../../../../types/api/models/disputes';
import PaymentMethodCell from '../../../TransactionsOverview/components/TransactionsTable/PaymentMethodCell';
import { Tag } from '../../../../internal/Tag/Tag';
import { TagVariant } from '../../../../internal/Tag/types';
import Icon from '../../../../internal/Icon';
import { Tooltip } from '../../../../internal/Tooltip/Tooltip';
import { getTranslation } from '../../../../../core/Localization/utils';

export const FIELDS = ['status', 'createdAt', 'paymentMethod', 'reasonCode', 'amount'] as const;
export type DisputesTableFields = (typeof FIELDS)[number];

export interface DisputesTableProps extends WithPaginationLimitSelection<PaginationProps> {
    balanceAccountId: string | undefined;
    loading: boolean;
    error?: AdyenPlatformExperienceError;
    onContactSupport?: () => void;
    showPagination: boolean;
    data: IDispute[] | undefined;
    customColumns?: CustomColumn<StringWithAutocompleteOptions<DisputesTableFields>>[];
}

export const DisputesTable: FC<DisputesTableProps> = ({
    error,
    loading,
    balanceAccountId,
    onContactSupport,
    showPagination,
    data,
    customColumns,
    ...paginationProps
}) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting('UTC');
    const [alert, setAlert] = useState<null | { title: string; description: string }>(null);
    const { refreshing } = useConfigContext();
    const isLoading = useMemo(() => loading || refreshing, [loading, refreshing]);
    const isSmAndUpViewport = useResponsiveContainer(containerQueries.up.sm);
    const isXsAndDownViewport = useResponsiveContainer(containerQueries.down.xs);

    const columns = useTableColumns({
        fields: FIELDS,
        fieldsKeys: {
            amount: 'disputes.disputedAmount',
            reasonCode: 'disputes.reason',
            paymentMethod: 'disputes.paymentMethod',
            createdAt: 'disputes.openedOn',
            status: 'disputes.status',
        },
        customColumns,
        columnConfig: useMemo(
            () => ({
                amount: {
                    position: 'right',
                },
            }),
            []
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

    const dateTranslations = {
        'disputes.daysToRespond__plural': 'disputes.daysToRespond__plural',
        'disputes.daysToRespond': 'disputes.daysToRespond__singular',
    };

    console.log(columns);

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
                emptyTableMessage={EMPTY_TABLE_MESSAGE}
                customCells={{
                    status: ({ value, item }) => {
                        if (value === 'won') {
                            return <Tag variant={TagVariant.SUCCESS} label={i18n.get('disputes.won')} />;
                        }
                        if (value === 'lost') {
                            return <Tag label={i18n.get('disputes.lost')} />;
                        }

                        if (value === 'action_needed' && item.dueDate) {
                            const targetDate = new Date(item.dueDate);
                            const now = Date.now();
                            const diffMs = targetDate.getTime() - now;
                            const seconds = Math.floor(diffMs / 1000);
                            const minutes = Math.floor(seconds / 60);
                            const hours = Math.floor(minutes / 60);
                            const days = Math.floor(hours / 24);

                            const isUrgent = days < 10;

                            const formattedDueDate = dateFormat(item.dueDate, DATE_FORMAT_DISPUTES_TAG);

                            return (
                                <Tooltip
                                    content={
                                        !isUrgent
                                            ? formattedDueDate
                                            : hours <= 24
                                            ? i18n.get('disputes.respondToday', { values: { date: formattedDueDate } })
                                            : i18n.get(
                                                  getTranslation(dateTranslations, 'disputes.daysToRespond', { count: days }) as TranslationKey,
                                                  {
                                                      values: { date: formattedDueDate, days },
                                                  }
                                              )
                                    }
                                >
                                    <div>
                                        <Tag variant={isUrgent ? TagVariant.ERROR : TagVariant.WARNING}>
                                            <div className={'adyen-pe-disputes-table__tag-content'}>
                                                {i18n.get('disputes.actionNeeded')}
                                                {isUrgent ? <Icon name={'warning-filled'} /> : null}
                                            </div>
                                        </Tag>
                                    </div>
                                </Tooltip>
                            );
                        }
                        if (value === 'under_review' || value === 'docs_submitted') {
                            return <Tag label={i18n.get('disputes.inProgress')} />;
                        }
                        return <Tag label={i18n.get('noData')} />;
                    },
                    amount: ({ value }) => {
                        return (
                            value && (
                                <Typography variant={TypographyVariant.BODY}>
                                    {i18n.amount(value.value, value.currency, { hideCurrency: true })}
                                </Typography>
                            )
                        );
                    },
                    createdAt: ({ value }) => {
                        if (!value) return null;
                        return value && <Typography variant={TypographyVariant.BODY}>{dateFormat(value, DATE_FORMAT_DISPUTES)}</Typography>;
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
