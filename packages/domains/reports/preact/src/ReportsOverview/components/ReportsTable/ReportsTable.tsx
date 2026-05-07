import { FC } from 'preact/compat';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { AdyenPlatformExperienceError, TranslationKey } from '@integration-components/core';
import type { CustomColumn, IReport } from '@integration-components/types';
import { DATE_FORMAT_REPORTS } from '@integration-components/utils';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import { getReportType, REPORTS_DOWNLOAD_DISABLED_TIMEOUT, REPORTS_TABLE_CLASS_NAMES } from '@integration-components/reports/domain';
import {
    containerQueries,
    useFreezePeriod,
    useResponsiveContainer,
    useTableColumns,
    useTimezoneAwareDateFormatting,
} from '@integration-components/hooks-preact';
import { useConfigContext, useCoreContext } from '@integration-components/core/preact';
import Alert from '@integration-components/ui-primitives-preact/Alert/Alert';
import Icon from '@integration-components/ui-primitives-preact/Icon';
import { AlertTypeOption } from '@integration-components/ui-primitives-preact/Alert/types';
import DownloadButton from '@integration-components/ui-primitives-preact/Button/DownloadButton/DownloadButton';
import DataGrid from '@integration-components/ui-primitives-preact/DataGrid';
import DataOverviewError from '@integration-components/ui-primitives-preact/DataOverviewError/DataOverviewError';
import Pagination from '@integration-components/ui-primitives-preact/Pagination';
import { PaginationProps, WithPaginationLimitSelection } from '@integration-components/ui-primitives-preact/Pagination/types';
import { TypographyElement, TypographyVariant } from '@integration-components/ui-primitives-preact/Typography/types';
import Typography from '@integration-components/ui-primitives-preact/Typography/Typography';
import './ReportsTable.scss';

export const FIELDS = ['createdAt', 'dateAndReportType', 'reportType', 'reportFile'] as const;
export type ReportsTableFields = (typeof FIELDS)[number];

const FIELDS_KEYS = {
    createdAt: 'reports.overview.list.fields.createdAt',
    reportFile: 'reports.overview.list.fields.reportFile',
    reportType: 'reports.overview.list.fields.reportType',
} as const satisfies Partial<Record<ReportsTableFields, TranslationKey>>;

export interface ReportsTableProps extends WithPaginationLimitSelection<PaginationProps> {
    balanceAccountId: string | undefined;
    loading: boolean;
    error?: AdyenPlatformExperienceError;
    onContactSupport?: () => void;
    showPagination: boolean;
    data: IReport[] | undefined;
    customColumns?: CustomColumn<StringWithAutocompleteOptions<ReportsTableFields>>[];
}

export const ReportsTable: FC<ReportsTableProps> = ({
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
    const { freeze, frozen } = useFreezePeriod(REPORTS_DOWNLOAD_DISABLED_TIMEOUT);
    const [alert, setAlert] = useState<null | { title: string; description: string }>(null);
    const { refreshing } = useConfigContext();
    const isLoading = useMemo(() => loading || refreshing, [loading, refreshing]);
    const isSmAndUpContainer = useResponsiveContainer(containerQueries.up.sm);
    const isXsAndDownContainer = useResponsiveContainer(containerQueries.down.xs);

    const columns = useTableColumns({
        customColumns,
        fields: FIELDS,
        fieldsKeys: FIELDS_KEYS,
        columnConfig: useMemo(
            () => ({
                dateAndReportType: { visible: isXsAndDownContainer },
                createdAt: { visible: isSmAndUpContainer },
                reportType: { visible: isSmAndUpContainer },
                reportFile: { visible: true, position: isXsAndDownContainer ? 'right' : undefined },
            }),
            [isSmAndUpContainer, isXsAndDownContainer]
        ),
    });

    const removeAlert = useCallback(() => {
        setAlert(null);
    }, []);

    const EMPTY_TABLE_MESSAGE = {
        title: 'reports.overview.errors.listEmpty',
        message: ['common.errors.updateFilters'],
    } satisfies { title: TranslationKey; message: TranslationKey | TranslationKey[] };

    const errorDisplay = useMemo(
        () => () => <DataOverviewError error={error} errorMessage={'reports.overview.errors.listUnavailable'} onContactSupport={onContactSupport} />,
        [error, onContactSupport]
    );

    const errorIcon = useMemo(() => <Icon name="warning" />, []);

    const onDownloadErrorAlert = useMemo(
        () => (error?: AdyenPlatformExperienceError) => {
            const alertDetails: Partial<{ key: number; description: string; title: string }> = {};
            switch (error?.errorCode) {
                case '999_429_001':
                    alertDetails.title = i18n.get('reports.overview.errors.download');
                    alertDetails.description = i18n.get('reports.overview.errors.tooManyDownloads');
                    break;
                case '00_500':
                default:
                    alertDetails.title = i18n.get('reports.overview.errors.download');
                    alertDetails.description = i18n.get('reports.overview.errors.retryDownload');
                    break;
            }
            setAlert(alertDetails as { title: string; description: string });
        },
        [i18n]
    );

    if (loading) setAlert(null);

    return (
        <div className={REPORTS_TABLE_CLASS_NAMES.base}>
            {alert && <Alert onClose={removeAlert} type={AlertTypeOption.WARNING} className={REPORTS_TABLE_CLASS_NAMES.alert} {...alert} />}
            <DataGrid
                errorDisplay={errorDisplay}
                error={error}
                columns={columns}
                data={data}
                loading={isLoading}
                outline={false}
                emptyTableMessage={EMPTY_TABLE_MESSAGE}
                customCells={{
                    createdAt: ({ value }) => {
                        if (!value) return null;
                        return (
                            value && (
                                <time dateTime={value}>
                                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                                        {dateFormat(value, DATE_FORMAT_REPORTS)}
                                    </Typography>
                                </time>
                            )
                        );
                    },
                    dateAndReportType: ({ item }) => {
                        return (
                            <div className={REPORTS_TABLE_CLASS_NAMES.dateReportType}>
                                {item?.type && (
                                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                                        {getReportType(i18n, item.type)}
                                    </Typography>
                                )}
                                <time dateTime={item.createdAt}>
                                    <Typography
                                        className={REPORTS_TABLE_CLASS_NAMES.dateReportTypeDate}
                                        el={TypographyElement.SPAN}
                                        variant={TypographyVariant.BODY}
                                    >
                                        {dateFormat(item.createdAt, DATE_FORMAT_REPORTS)}
                                    </Typography>
                                </time>
                            </div>
                        );
                    },
                    reportType: ({ item }) => {
                        return (
                            item?.type && (
                                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                                    {getReportType(i18n, item.type)}
                                </Typography>
                            )
                        );
                    },
                    reportFile: ({ item }) => {
                        const queryParam = {
                            query: { balanceAccountId: balanceAccountId, createdAt: item.createdAt, type: item.type },
                        };
                        return (
                            <DownloadButton
                                className={REPORTS_TABLE_CLASS_NAMES.download}
                                endpointName={'downloadReport'}
                                disabled={frozen}
                                requestParams={queryParam}
                                onDownloadRequested={freeze}
                                setError={onDownloadErrorAlert}
                                errorDisplay={errorIcon}
                                aria-label={i18n.get('reports.overview.list.controls.downloadReport.label')}
                            />
                        );
                    },
                }}
            >
                {showPagination && (
                    <DataGrid.Footer>
                        <Pagination
                            {...paginationProps}
                            ariaLabelKey="reports.overview.pagination.label"
                            limitSelectAriaLabelKey="reports.overview.pagination.controls.limitSelect.label"
                        />
                    </DataGrid.Footer>
                )}
            </DataGrid>
        </div>
    );
};
