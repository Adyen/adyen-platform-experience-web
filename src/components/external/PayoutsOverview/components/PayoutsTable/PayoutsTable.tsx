import cx from 'classnames';
import { FC } from 'preact/compat';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import { getCurrencyCode } from '../../../../../core/Localization/amount/amount-util';
import { TranslationKey } from '../../../../../translations';
import { IPayout } from '../../../../../types';
import { useCallback, useMemo } from 'preact/hooks';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';
import DataGrid from '../../../../internal/DataGrid';
import { DATE_FORMAT_PAYOUTS, DATE_FORMAT_PAYOUTS_MOBILE } from '../../../../../constants';
import DataOverviewError from '../../../../internal/DataOverviewError/DataOverviewError';
import Pagination from '../../../../internal/Pagination';
import { PaginationProps, WithPaginationLimitSelection } from '../../../../internal/Pagination/types';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { getLabel } from '../../../../utils/getLabel';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import { BASE_CLASS, NET_PAYOUT_CLASS } from './constants';
import './PayoutsTable.scss';
import { useTableColumns } from '../../../../../hooks/useTableColumns';
import { CustomColumn } from '../../../../types';
import { StringWithAutocompleteOptions } from '../../../../../utils/types';

const AMOUNT_FIELDS = ['fundsCapturedAmount', 'adjustmentAmount', 'payoutAmount'] as const;
export const PAYOUT_TABLE_FIELDS = ['createdAt', ...AMOUNT_FIELDS] as const;
export type PayoutsTableFields = (typeof PAYOUT_TABLE_FIELDS)[number];

const _isAmountFieldKey = (key: (typeof PAYOUT_TABLE_FIELDS)[number]): key is (typeof AMOUNT_FIELDS)[number] => {
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
    customColumns?: CustomColumn<StringWithAutocompleteOptions<PayoutsTableFields>>[];
}

export const PayoutsTable: FC<PayoutsTableProps> = ({
    error,
    loading,
    onContactSupport,
    onRowClick,
    showDetails,
    showPagination,
    data,
    customColumns,
    ...paginationProps
}) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting('UTC');
    const { refreshing } = useConfigContext();
    const isLoading = useMemo(() => loading || refreshing, [loading, refreshing]);
    const isSmAndUpContainer = useResponsiveContainer(containerQueries.up.sm);

    const getAmountFieldConfig = useCallback(
        (key: (typeof PAYOUT_TABLE_FIELDS)[number]) => {
            const label = i18n.get(getLabel(key));
            if (_isAmountFieldKey(key)) {
                return {
                    label: data?.[0]?.[key]?.currency ? `${label} (${getCurrencyCode(data?.[0]?.[key]?.currency)})` : label,
                    position: 'right',
                } as const;
            }
        },
        [data, i18n]
    );

    const columns = useTableColumns({
        fields: PAYOUT_TABLE_FIELDS,
        customColumns,
        columnConfig: useMemo(
            () => ({
                fundsCapturedAmount: { ...getAmountFieldConfig('fundsCapturedAmount'), visible: isSmAndUpContainer },
                adjustmentAmount: { ...getAmountFieldConfig('adjustmentAmount'), visible: isSmAndUpContainer },
                payoutAmount: getAmountFieldConfig('payoutAmount'),
            }),
            [getAmountFieldConfig, isSmAndUpContainer]
        ),
    });

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
                        if (!isSmAndUpContainer) {
                            return <time dateTime={value}>{dateFormat(value, DATE_FORMAT_PAYOUTS_MOBILE)}</time>;
                        }
                        return (
                            value && (
                                <time dateTime={value}>
                                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                                        {dateFormat(value, DATE_FORMAT_PAYOUTS)}
                                    </Typography>
                                </time>
                            )
                        );
                    },
                    fundsCapturedAmount: ({ value }) => {
                        return (
                            value && (
                                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                                    {i18n.amount(value.value, value.currency, { hideCurrency: true })}
                                </Typography>
                            )
                        );
                    },
                    adjustmentAmount: ({ value }) => {
                        return (
                            value && (
                                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                                    {i18n.amount(value.value, value.currency, { hideCurrency: true })}
                                </Typography>
                            )
                        );
                    },
                    payoutAmount: ({ value }) => {
                        return (
                            value && (
                                <Typography
                                    el={TypographyElement.SPAN}
                                    variant={TypographyVariant.BODY}
                                    className={cx({ [`${NET_PAYOUT_CLASS}--strong`]: !isSmAndUpContainer })}
                                >
                                    {i18n.amount(value.value, value.currency, { hideCurrency: isSmAndUpContainer })}
                                </Typography>
                            )
                        );
                    },
                }}
            >
                {showPagination && (
                    <DataGrid.Footer>
                        <Pagination
                            {...paginationProps}
                            limitSelectorAriaLabelKey="payouts.pagination.limitSelectorLabel"
                            pageLimitStatusKey="payouts.pagination.pageLimitStatus"
                            pageSizeStatusKey="payouts.pagination.pageSizeStatus"
                        />
                    </DataGrid.Footer>
                )}
            </DataGrid>
        </div>
    );
};
