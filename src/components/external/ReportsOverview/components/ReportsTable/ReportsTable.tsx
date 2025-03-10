import { FC } from 'preact/compat';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import { TranslationKey } from '../../../../../translations';
import { IReport } from '../../../../../types';
import useFreezePeriod from '../../../../../hooks/useFreezePeriod';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';
import Alert from '../../../../internal/Alert/Alert';
import { AlertTypeOption } from '../../../../internal/Alert/types';
import DownloadButton from '../../../../internal/Button/DownloadButton/DownloadButton';
import DataGrid from '../../../../internal/DataGrid';
import { DATE_FORMAT_REPORTS } from '../../../../../constants';
import DataOverviewError from '../../../../internal/DataOverviewError/DataOverviewError';
import Pagination from '../../../../internal/Pagination';
import { PaginationProps, WithPaginationLimitSelection } from '../../../../internal/Pagination/types';
import Warning from '../../../../internal/SVGIcons/Warning';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { mediaQueries, useResponsiveViewport } from '../../../../../hooks/useResponsiveViewport';
import { BASE_CLASS, DATE_TYPE_CLASS, DATE_TYPE_DATE_SECTION_CLASS, DISABLED_BUTTONS_TIMEOUT } from './constants';
import './ReportsTable.scss';
import { CustomColumn } from '../../../../types';
import { StringWithAutocompleteOptions } from '../../../../../utils/types';
import { useTableColumns } from '../../../../../hooks/useTableColumns';

export const FIELDS = ['createdAt', 'dateAndReportType', 'reportType', 'reportFile'] as const;
export type ReportsTableFields = (typeof FIELDS)[number];

export interface ReportsTableProps extends WithPaginationLimitSelection<PaginationProps> {
    balanceAccountId: string | undefined;
    loading: boolean;
    error?: AdyenPlatformExperienceError;
    onContactSupport?: () => void;
    showPagination: boolean;
    data: IReport[] | undefined;
    customColumns?: CustomColumn<StringWithAutocompleteOptions<ReportsTableFields>>[] | StringWithAutocompleteOptions<ReportsTableFields>[];
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
    const isSmAndUpViewport = useResponsiveViewport(mediaQueries.up.sm);
    const isXsAndDownViewport = useResponsiveViewport(mediaQueries.down.xs);

    const columns = useTableColumns({
        fields: FIELDS,
        customColumns,
        columnConfig: useMemo(
            () => ({
                dateAndReportType: { visible: isXsAndDownViewport },
                createdAt: { visible: isSmAndUpViewport },
                reportType: { visible: isSmAndUpViewport },
                reportFile: { visible: true, position: isXsAndDownViewport ? 'right' : undefined },
            }),
            [isSmAndUpViewport, isXsAndDownViewport]
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

    const errorIcon = useMemo(() => <Warning />, []);

    const onDownloadErrorAlert = useMemo(
        () => (error?: AdyenPlatformExperienceError) => {
            const alertDetails: Partial<{ key: number; description: string; title: string }> = {};
            switch (error?.errorCode) {
                case '999_429_001':
                    alertDetails.title = i18n.get('error.somethingWentWrongWithDownload');
                    alertDetails.description = i18n.get('reportsError.tooManyDownloads');
                    break;
                case '00_500':
                default:
                    alertDetails.title = i18n.get('error.somethingWentWrongWithDownload');
                    alertDetails.description = i18n.get('error.pleaseTryAgainLater');
                    break;
            }
            setAlert(alertDetails as { title: string; description: string });
        },
        [error, onContactSupport]
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
                        return value && <Typography variant={TypographyVariant.BODY}>{dateFormat(value, DATE_FORMAT_REPORTS)}</Typography>;
                    },
                    dateAndReportType: ({ item }) => {
                        return (
                            <div className={DATE_TYPE_CLASS}>
                                <Typography variant={TypographyVariant.BODY} stronger>
                                    {i18n.get(`reportType.${item?.['type']}`)}
                                </Typography>
                                <Typography className={DATE_TYPE_DATE_SECTION_CLASS} variant={TypographyVariant.BODY}>
                                    {dateFormat(item.createdAt, DATE_FORMAT_REPORTS)}
                                </Typography>
                            </div>
                        );
                    },
                    reportType: ({ item }) => {
                        return item?.['type'] && <Typography variant={TypographyVariant.BODY}>{i18n.get(`reportType.${item?.['type']}`)}</Typography>;
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
                                params={queryParam}
                                onDownloadRequested={freeze}
                                setError={onDownloadErrorAlert}
                                errorDisplay={errorIcon}
                            />
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
