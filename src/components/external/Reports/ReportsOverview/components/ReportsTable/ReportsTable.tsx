import { FC } from 'preact/compat';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../../core/ConfigContext';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import AdyenPlatformExperienceError from '../../../../../../core/Errors/AdyenPlatformExperienceError';
import { TranslationKey } from '../../../../../../translations';
import { IReport } from '../../../../../../types';
import useFreezePeriod from '../../../../../../hooks/useFreezePeriod';
import useTimezoneAwareDateFormatting from '../../../../../../hooks/useTimezoneAwareDateFormatting';
import Alert from '../../../../../internal/Alert/Alert';
import Icon from '../../../../../internal/Icon';
import { AlertTypeOption } from '../../../../../internal/Alert/types';
import DownloadButton from '../../../../../internal/Button/DownloadButton/DownloadButton';
import DataGrid from '../../../../../internal/DataGrid';
import { DATE_FORMAT_REPORTS } from '../../../../../../constants';
import DataOverviewError from '../../../../../internal/DataOverviewError/DataOverviewError';
import Pagination from '../../../../../internal/Pagination';
import { PaginationProps, WithPaginationLimitSelection } from '../../../../../internal/Pagination/types';
import { TypographyElement, TypographyVariant } from '../../../../../internal/Typography/types';
import Typography from '../../../../../internal/Typography/Typography';
import { containerQueries, useResponsiveContainer } from '../../../../../../hooks/useResponsiveContainer';
import { BASE_CLASS, DATE_TYPE_CLASS, DATE_TYPE_DATE_SECTION_CLASS, DISABLED_BUTTONS_TIMEOUT } from './constants';
import './ReportsTable.scss';
import { CustomColumn } from '../../../../../types';
import { StringWithAutocompleteOptions } from '../../../../../../utils/types';
import { useTableColumns } from '../../../../../../hooks/useTableColumns';
import { getReportType } from '../../../../../utils/translation/getters';

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
    const { freeze, frozen } = useFreezePeriod(DISABLED_BUTTONS_TIMEOUT);
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
        <div className={BASE_CLASS}>
            {alert && <Alert onClose={removeAlert} type={AlertTypeOption.WARNING} className={'adyen-pe-reports-table-alert'} {...alert} />}
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
                            <div className={DATE_TYPE_CLASS}>
                                {item?.type && (
                                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                                        {getReportType(i18n, item.type)}
                                    </Typography>
                                )}
                                <time dateTime={item.createdAt}>
                                    <Typography className={DATE_TYPE_DATE_SECTION_CLASS} el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
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
                                className={'adyen-pe-reports-table--download'}
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
