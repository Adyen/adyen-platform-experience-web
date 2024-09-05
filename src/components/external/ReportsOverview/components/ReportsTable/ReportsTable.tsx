import { FC } from 'preact/compat';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { useAuthContext } from '../../../../../core/Auth';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import { TranslationKey } from '../../../../../core/Localization/types';
import { IReport } from '../../../../../types';
import useTimezoneAwareDateFormatting from '../../../../hooks/useTimezoneAwareDateFormatting';
import Alert from '../../../../internal/Alert/Alert';
import { AlertTypeOption } from '../../../../internal/Alert/types';
import DownloadButton from '../../../../internal/Button/DownloadButton/DownloadButton';
import DataGrid from '../../../../internal/DataGrid';
import { CellTextPosition } from '../../../../internal/DataGrid/types';
import { DATE_FORMAT_REPORTS_MOBILE } from '../../../../internal/DataOverviewDisplay/constants';
import DataOverviewError from '../../../../internal/DataOverviewError/DataOverviewError';
import Pagination from '../../../../internal/Pagination';
import { PaginationProps, WithPaginationLimitSelection } from '../../../../internal/Pagination/types';
import Warning from '../../../../internal/SVGIcons/Warning';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { getLabel } from '../../../../utils/getLabel';
import { mediaQueries, useResponsiveViewport } from '../../../TransactionsOverview/hooks/useResponsiveViewport';
import { BASE_CLASS, DATE_TYPE_CLASS, DATE_TYPE_DATE_SECTION_CLASS } from './constants';
import './ReportsTable.scss';

const FIELDS = ['createdAt', 'dateAndReportType', 'reportType', 'reportFile'] as const;
type FieldsType = (typeof FIELDS)[number];

export interface ReportsTableProps extends WithPaginationLimitSelection<PaginationProps> {
    balanceAccountId: string;
    loading: boolean;
    error?: AdyenPlatformExperienceError;
    onContactSupport?: () => void;
    showPagination: boolean;
    data: IReport[] | undefined;
}

export const ReportsTable: FC<ReportsTableProps> = ({
    error,
    loading,
    balanceAccountId,
    onContactSupport,
    showPagination,
    data,
    ...paginationProps
}) => {
    const { i18n } = useCoreContext();
    const { fullDateFormat, dateFormat } = useTimezoneAwareDateFormatting('UTC');
    const [alert, setAlert] = useState<null | { title: string; description: string }>(null);
    const { refreshing } = useAuthContext();
    const isLoading = useMemo(() => loading || refreshing, [loading, refreshing]);
    const isSmAndUpViewport = useResponsiveViewport(mediaQueries.up.sm);
    const isXsAndDownViewport = useResponsiveViewport(mediaQueries.down.sm);

    const fieldsVisibility: Partial<Record<FieldsType, boolean>> = useMemo(
        () => ({
            dateAndReportType: isXsAndDownViewport,
            createdAt: isSmAndUpViewport,
            reportType: isSmAndUpViewport,
            reportFile: true,
        }),
        [isXsAndDownViewport, isSmAndUpViewport]
    );

    const columns = useMemo(
        () =>
            FIELDS.map(key => {
                const label = i18n.get(getLabel(key));
                return {
                    key,
                    label: label,
                    position: isXsAndDownViewport && key === 'reportFile' ? CellTextPosition.RIGHT : undefined,
                    visible: fieldsVisibility[key],
                };
            }),
        [i18n, data, fieldsVisibility]
    );

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
            {alert && (
                <Alert isOpen={!!alert} onClose={removeAlert} type={AlertTypeOption.WARNING} className={'adyen-pe-reports-table-alert'} {...alert} />
            )}
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
                        return value && <Typography variant={TypographyVariant.BODY}>{fullDateFormat(value)}</Typography>;
                    },
                    dateAndReportType: ({ item }) => {
                        return (
                            <div className={DATE_TYPE_CLASS}>
                                <Typography variant={TypographyVariant.BODY} stronger>
                                    {item.type}
                                </Typography>
                                <Typography className={DATE_TYPE_DATE_SECTION_CLASS} variant={TypographyVariant.BODY}>
                                    {dateFormat(item.createdAt, DATE_FORMAT_REPORTS_MOBILE)}
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
                                params={queryParam}
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
