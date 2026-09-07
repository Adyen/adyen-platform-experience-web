import cx from 'classnames';
import { FC } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { AdyenPlatformExperienceError, TranslationKey } from '@integration-components/core';
import type { CustomColumn, IPayout } from '@integration-components/types';
import { containerQueries, useResponsiveContainer, useTableColumns, useTimezoneAwareDateFormatting } from '@integration-components/hooks-preact';
import { useConfigContext, useCoreContext } from '@integration-components/core/preact';
import { DATE_FORMAT_PAYOUTS, DATE_FORMAT_PAYOUTS_MOBILE } from '@integration-components/utils';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import DataGrid from '@integration-components/ui-components-preact/DataGrid';
import DataOverviewError from '@integration-components/ui-components-preact/DataOverviewError/DataOverviewError';
import Pagination from '@integration-components/ui-components-preact/Pagination';
import { PaginationProps, WithPaginationLimitSelection } from '@integration-components/ui-components-preact/Pagination/types';
import { TypographyElement, TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';
import Typography from '@integration-components/ui-components-preact/Typography/Typography';
import { BASE_CLASS, NET_PAYOUT_CLASS } from './constants';
import './PayoutsTable.scss';

export const PAYOUT_TABLE_FIELDS = ['createdAt', 'fundsCapturedAmount', 'adjustmentAmount', 'payoutAmount'] as const;
export type PayoutsTableFields = (typeof PAYOUT_TABLE_FIELDS)[number];

const FIELDS_KEYS = {
    adjustmentAmount: 'payouts.overview.list.fields.adjustmentAmount',
    createdAt: 'payouts.overview.list.fields.createdAt',
    fundsCapturedAmount: 'payouts.overview.list.fields.fundsCapturedAmount',
    payoutAmount: 'payouts.overview.list.fields.payoutAmount',
} as const satisfies Partial<Record<PayoutsTableFields, TranslationKey>>;

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

    const columns = useTableColumns({
        customColumns,
        fields: PAYOUT_TABLE_FIELDS,
        fieldsKeys: FIELDS_KEYS,
        columnConfig: useMemo(
            () => ({
                fundsCapturedAmount: { position: 'right', visible: isSmAndUpContainer },
                adjustmentAmount: { position: 'right', visible: isSmAndUpContainer },
                payoutAmount: { position: 'right' },
            }),
            [isSmAndUpContainer]
        ),
    });

    const EMPTY_TABLE_MESSAGE = {
        title: 'payouts.overview.errors.listEmpty',
        message: ['common.errors.updateFilters'],
    } satisfies { title: TranslationKey; message: TranslationKey | TranslationKey[] };

    const errorDisplay = useMemo(
        () => () => <DataOverviewError error={error} errorMessage={'payouts.overview.errors.listUnavailable'} onContactSupport={onContactSupport} />,
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
                                    {i18n.amount(value.value, value.currency, { hideCurrency: false })}
                                </Typography>
                            )
                        );
                    },
                    adjustmentAmount: ({ value }) => {
                        return (
                            value && (
                                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                                    {i18n.amount(value.value, value.currency, { hideCurrency: false })}
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
                                    {i18n.amount(value.value, value.currency, { hideCurrency: false })}
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
                            ariaLabelKey="payouts.overview.pagination.label"
                            limitSelectAriaLabelKey="payouts.overview.pagination.controls.limitSelect.label"
                        />
                    </DataGrid.Footer>
                )}
            </DataGrid>
        </div>
    );
};
