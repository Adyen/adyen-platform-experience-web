import DataOverviewError from '@src/components/internal/DataOverviewError/DataOverviewError';
import { BASE_CLASS } from '@src/components/external/PayoutsOverview/components/PayoutsTable/constants';
import { PaginationProps, WithPaginationLimitSelection } from '@src/components/internal/Pagination/types';
import { getLabel } from '@src/components/utils/getLabel';
import useCoreContext from '@src/core/Context/useCoreContext';
import AdyenPlatformExperienceError from '@src/core/Errors/AdyenPlatformExperienceError';
import { getCurrencyCode } from '@src/core/Localization/amount/amount-util';
import { IBalanceAccountBase, IPayout } from '@src/types';
import { useMemo } from 'preact/hooks';
import DataGrid from '../../../../internal/DataGrid';
import Pagination from '../../../../internal/Pagination';
import { TranslationKey } from '@src/core/Localization/types';
import { FC } from 'preact/compat';

const FIELDS = ['createdAt', 'grossAmount', 'chargesAmount', 'netAmount'] as const;

export interface PayoutsTableProps extends WithPaginationLimitSelection<PaginationProps> {
    balanceAccounts: IBalanceAccountBase[] | undefined;
    loading: boolean;
    error?: AdyenPlatformExperienceError;
    onContactSupport?: () => void;
    onRowClick: (value: any) => void;
    showDetails?: boolean;
    showPagination: boolean;
    data: IPayout[] | undefined;
}
export const PayoutsTable: FC<PayoutsTableProps> = ({
    error,
    loading,
    onContactSupport,
    onRowClick,
    showDetails,
    showPagination,
    data,
    ...paginationProps
}) => {
    const { i18n } = useCoreContext();

    const columns = useMemo(
        () =>
            FIELDS.map(key => {
                const label = i18n.get(getLabel(key));
                if (key === 'grossAmount' || key === 'netAmount' || key === 'chargesAmount') {
                    return {
                        key,
                        label: data?.[0]?.[key]?.currency ? `${label} (${getCurrencyCode(data?.[0]?.[key]?.currency)})` : label,
                    };
                }

                return { key, label };
            }),
        [i18n, data]
    );

    const EMPTY_TABLE_MESSAGE = {
        title: 'noPayoutsFound',
        message: ['tryDifferentSearchOrResetYourFiltersAndWeWillTryAgain'],
    } satisfies { title: TranslationKey; message: TranslationKey | TranslationKey[] };

    const errorDisplay = useMemo(
        () => () => <DataOverviewError error={error} errorMessage={'weCouldNotLoadYourPayouts'} onContactSupport={onContactSupport} />,
        [error, onContactSupport]
    );
    return (
        <div className={BASE_CLASS}>
            <DataGrid
                errorDisplay={errorDisplay}
                error={error}
                columns={columns}
                data={data}
                loading={loading}
                outline={false}
                onRowClick={{ callback: onRowClick }}
                emptyTableMessage={EMPTY_TABLE_MESSAGE}
                customCells={{
                    createdAt: ({ value }) => value && i18n.fullDate(value),
                    grossAmount: ({ value }) => {
                        return value && <span>{i18n.amount(value.value, value.currency, { hideCurrency: true })}</span>;
                    },
                    chargesAmount: ({ value }) => {
                        return value && <span>{i18n.amount(value.value, value.currency, { hideCurrency: true })}</span>;
                    },
                    netAmount: ({ value }) => {
                        return value && <span>{i18n.amount(value.value, value.currency, { hideCurrency: true })}</span>;
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
