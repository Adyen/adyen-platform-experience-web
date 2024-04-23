import { OnSelection } from '@src/components';
import DataOverviewError from '@src/components/internal/DataOverviewError/DataOverviewError';
import { BASE_CLASS } from '@src/components/external/PayoutsOverview/components/PayoutsTable/constants';
import { PaginationProps, WithPaginationLimitSelection } from '@src/components/internal/Pagination/types';
import { getLabel } from '@src/components/utils/getLabels';
import useCoreContext from '@src/core/Context/useCoreContext';
import AdyenPlatformExperienceError from '@src/core/Errors/AdyenPlatformExperienceError';
import { IBalanceAccountBase } from '@src/types';
import { useMemo } from 'preact/hooks';
import { BASIC_PAYOUTS_LIST } from '../../../../../../../../mocks/src/payouts';
import DataGrid from '../../../../internal/DataGrid';
import Pagination from '../../../../internal/Pagination';
import { TranslationKey } from '@src/core/Localization/types';
import { FC } from 'preact/compat';

// Remove status column temporarily
const FIELDS = ['creationDate', 'grossPayout', 'adjustments', 'netPayout'] as const;

export interface PayoutsTableProps extends WithPaginationLimitSelection<PaginationProps> {
    balanceAccounts: IBalanceAccountBase[] | undefined;
    loading: boolean;
    error?: AdyenPlatformExperienceError;
    onContactSupport?: () => void;
    onRowClick: (value: any) => void;
    onDataSelection?: OnSelection;
    showDetails?: boolean;
    showPagination: boolean;
    data: typeof BASIC_PAYOUTS_LIST | undefined;
}
export const PayoutsTable: FC<PayoutsTableProps> = ({
    error,
    loading,
    onContactSupport,
    onRowClick,
    onDataSelection,
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
                // if (key === 'amount') {
                //     return {
                //         key,
                //         label: hasMultipleCurrencies
                //             ? label
                //             : `${label} ${availableCurrencies && availableCurrencies[0] ? `(${getCurrencyCode(availableCurrencies[0])})` : ''}`,
                //         position: key === 'amount' ? CellTextPosition.RIGHT : undefined,
                //     };
                // }

                return { key, label };
            }),
        [i18n]
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
                    // Remove status column temporarily
                    creationDate: ({ value }) => value && i18n.fullDate(value),
                    grossPayout: ({ value }) => {
                        return value && <span>{i18n.amount(value.value, value.currency, { hideCurrency: true })}</span>;
                    },
                    adjustments: ({ value }) => {
                        return value && <span>{i18n.amount(value.value, value.currency, { hideCurrency: true })}</span>;
                    },
                    netPayout: ({ value }) => {
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
