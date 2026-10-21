import { computed } from 'vue';
import { DEFAULT_PAGE_LIMIT, type PaginationConfig } from '@integration-components/utils';

export interface UsePageLimitOptions<Limit extends number> {
    options: readonly [Limit, ...Limit[]];
    pagination: () => PaginationConfig<NoInfer<Limit>> | undefined;
}

const isOption = <Limit extends number>(options: readonly Limit[], limit: number | undefined): limit is Limit => options.includes(limit as Limit);

/**
 * Resolves the initial limit and the selectable limit options for a paginated list.
 * Falls back to `DEFAULT_PAGE_LIMIT` (or the first option) when `pagination.defaultLimit` is not one of the options.
 *
 * Domains use `DEFAULT_PAGE_LIMITS` unless they need a different set (e.g. due to backend limits).
 * To override, define the set in the domain layer and use it for both the public prop type and this composable:
 *
 * @example
 * // domain/src/TransactionsOverview/constants.ts
 * export const TRANSACTIONS_PAGE_LIMITS = [10, 15, 20, 25, 30, 50, 100] as const;
 * export type TransactionsPageLimit = (typeof TRANSACTIONS_PAGE_LIMITS)[number];
 *
 * // domain/src/TransactionsOverview/types.ts
 * export interface TransactionsOverviewProps extends PaginationProps<TransactionsPageLimit> {}
 *
 * // vue/src/TransactionsOverview/types.ts
 * export type TransactionsOverviewExternalProps = UIElementProps & TransactionsOverviewProps;
 *
 * // vue/src/TransactionsOverview/composables/useTransactionsList.ts
 * const pageLimit = usePageLimit({ options: TRANSACTIONS_PAGE_LIMITS, pagination: () => props().pagination });
 */
export function usePageLimit<Limit extends number>({ options, pagination }: UsePageLimitOptions<Limit>) {
    const defaultLimit = pagination()?.defaultLimit;
    const fallback = isOption(options, DEFAULT_PAGE_LIMIT) ? DEFAULT_PAGE_LIMIT : options[0];

    if (defaultLimit !== undefined && !isOption(options, defaultLimit)) {
        console.warn(
            `pagination.defaultLimit "${defaultLimit}" is not supported. Falling back to ${fallback}. Supported values: ${options.join(', ')}.`
        );
    }

    return {
        initialLimit: isOption(options, defaultLimit) ? defaultLimit : fallback,
        limitOptions: computed<readonly number[] | undefined>(() => (pagination()?.disableLimitSelection ? undefined : options)),
    } as const;
}

/**
 * Widens the readonly limit options to the mutable `number[]` that Bento's
 * `BentoPaginationProps.pageSizeItems` declares. The datagrid only reads the array,
 * so this stays an identity function instead of copying on every render.
 */
export const asPageSizeItems = (limitOptions: readonly number[] | undefined) => limitOptions as number[] | undefined;

export default usePageLimit;
