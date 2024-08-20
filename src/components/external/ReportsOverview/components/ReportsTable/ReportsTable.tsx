import { FC } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { useAuthContext } from '../../../../../core/Auth';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import { TranslationKey } from '../../../../../core/Localization/types';
import { IReport } from '../../../../../types';
import useTimezoneAwareDateFormatting from '../../../../hooks/useTimezoneAwareDateFormatting';
import DownloadButton from '../../../../internal/Button/DownloadButton/DownloadButton';
import DataGrid from '../../../../internal/DataGrid';
import { DATE_FORMAT_REPORTS_MOBILE } from '../../../../internal/DataOverviewDisplay/constants';
import DataOverviewError from '../../../../internal/DataOverviewError/DataOverviewError';
import Pagination from '../../../../internal/Pagination';
import { PaginationProps, WithPaginationLimitSelection } from '../../../../internal/Pagination/types';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { getLabel } from '../../../../utils/getLabel';
import { mediaQueries, useResponsiveViewport } from '../../../TransactionsOverview/hooks/useResponsiveViewport';
import { BASE_CLASS } from './constants';
import './ReportsTable.scss';

const FIELDS = ['createdAt', 'reportName', 'reportFile'] as const;

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
    const { refreshing } = useAuthContext();
    const isLoading = useMemo(() => loading || refreshing, [loading, refreshing]);
    const isSmAndUpViewport = useResponsiveViewport(mediaQueries.up.sm);

    const columns = useMemo(
        () =>
            FIELDS.map(key => {
                const label = i18n.get(getLabel(key));
                return {
                    key,
                    label: label,
                };
            }),
        [i18n, data]
    );

    const EMPTY_TABLE_MESSAGE = {
        title: 'noReportsFound',
        message: ['tryDifferentSearchOrResetYourFiltersAndWeWillTryAgain'],
    } satisfies { title: TranslationKey; message: TranslationKey | TranslationKey[] };

    const errorDisplay = useMemo(
        () => () => <DataOverviewError error={error} errorMessage={'weCouldNotLoadYourReports'} onContactSupport={onContactSupport} />,
        [error, onContactSupport]
    );

    return (
        <div className={BASE_CLASS}>
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
                        if (!isSmAndUpViewport) return dateFormat(value, DATE_FORMAT_REPORTS_MOBILE);
                        return value && <Typography variant={TypographyVariant.BODY}>{fullDateFormat(value)}</Typography>;
                    },
                    reportName: ({ item }) => {
                        return item?.['name'] && <Typography variant={TypographyVariant.BODY}>{item?.['name']}</Typography>;
                    },
                    reportFile: ({ item }) => {
                        const queryParam = {
                            query: { balanceAccountId: balanceAccountId, createdAt: item.createdAt },
                        };
                        return <DownloadButton className={'adyen-pe-report-download'} endpointName={'downloadReport'} params={queryParam} />;
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
