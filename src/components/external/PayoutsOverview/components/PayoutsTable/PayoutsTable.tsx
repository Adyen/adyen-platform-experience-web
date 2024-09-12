import { DATE_FORMAT_MOBILE_PAYOUTS, DATE_FORMAT_PAYOUTS } from '../../../../internal/DataOverviewDisplay/constants';
import DataOverviewError from '../../../../internal/DataOverviewError/DataOverviewError';
import { BASE_CLASS, NET_PAYOUT_CLASS } from './constants';
import { PaginationProps, WithPaginationLimitSelection } from '../../../../internal/Pagination/types';
import { getLabel } from '../../../../utils/getLabel';
import { useAuthContext } from '../../../../../core/Auth';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useTimezoneAwareDateFormatting from '../../../../hooks/useTimezoneAwareDateFormatting';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import { getCurrencyCode } from '../../../../../core/Localization/amount/amount-util';
import { IPayout } from '../../../../../types';
import { useMemo } from 'preact/hooks';
import DataGrid from '../../../../internal/DataGrid';
import Pagination from '../../../../internal/Pagination';
import { TranslationKey } from '../../../../../translations';
import { FC } from 'preact/compat';
import { mediaQueries, useResponsiveViewport } from '../../../TransactionsOverview/hooks/useResponsiveViewport';
import { CellTextPosition } from '../../../../internal/DataGrid/types';
import cx from 'classnames';
import './PayoutsTable.scss';

const AMOUNT_FIELDS = ['fundsCapturedAmount', 'adjustmentAmount', 'payoutAmount'] as const;
const FIELDS = ['createdAt', ...AMOUNT_FIELDS] as const;

const _isAmountFieldKey = (key: (typeof FIELDS)[number]): key is (typeof AMOUNT_FIELDS)[number] => {
    return AMOUNT_FIELDS.includes(key as (typeof AMOUNT_FIELDS)[number]);
};

export interface PayoutsTableProps extends WithPaginationLimitSelection<PaginationProps> {
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
    const { dateFormat } = useTimezoneAwareDateFormatting('UTC');
    const { refreshing } = useAuthContext();
    const isLoading = useMemo(() => loading || refreshing, [loading, refreshing]);
    const isSmAndUpViewport = useResponsiveViewport(mediaQueries.up.sm);
    const fieldsVisibility: Partial<Record<(typeof FIELDS)[number], boolean>> = useMemo(
        () => ({
            fundsCapturedAmount: isSmAndUpViewport,
            adjustmentAmount: isSmAndUpViewport,
        }),
        [isSmAndUpViewport]
    );

    const columns = useMemo(
        () =>
            FIELDS.map(key => {
                const label = i18n.get(getLabel(key));
                if (_isAmountFieldKey(key)) {
                    return {
                        key,
                        label: data?.[0]?.[key]?.currency ? `${label} (${getCurrencyCode(data?.[0]?.[key]?.currency)})` : label,
                        visible: fieldsVisibility[key],
                        position: CellTextPosition.RIGHT,
                    };
                }

                return { key, label, visible: fieldsVisibility[key] };
            }),
        [i18n, fieldsVisibility, data]
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
                loading={isLoading}
                outline={false}
                onRowClick={{ callback: onRowClick }}
                emptyTableMessage={EMPTY_TABLE_MESSAGE}
                customCells={{
                    createdAt: ({ value }) => {
                        if (!value) return null;
                        if (!isSmAndUpViewport) return dateFormat(value, DATE_FORMAT_MOBILE_PAYOUTS);
                        return value && dateFormat(value, DATE_FORMAT_PAYOUTS);
                    },
                    fundsCapturedAmount: ({ value }) => {
                        return value && <span>{i18n.amount(value.value, value.currency, { hideCurrency: true })}</span>;
                    },
                    adjustmentAmount: ({ value }) => {
                        return value && <span>{i18n.amount(value.value, value.currency, { hideCurrency: true })}</span>;
                    },
                    payoutAmount: ({ value }) => {
                        return (
                            value && (
                                <span className={cx({ [`${NET_PAYOUT_CLASS}--strong`]: !isSmAndUpViewport })}>
                                    {i18n.amount(value.value, value.currency, { hideCurrency: isSmAndUpViewport })}
                                </span>
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
