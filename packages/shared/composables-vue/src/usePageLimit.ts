import { computed } from 'vue';
import { DEFAULT_PAGE_LIMIT, type PaginationConfig } from '@integration-components/utils';

export interface UsePageLimitOptions<Limit extends number> {
    options: readonly [Limit, ...Limit[]];
    pagination: () => PaginationConfig<number> | undefined;
}

const isOption = <Limit extends number>(options: readonly Limit[], limit: number | undefined): limit is Limit => options.includes(limit as Limit);

/**
 * Resolves the initial page size and the selectable page size options for a paginated list.
 * Falls back to `DEFAULT_PAGE_LIMIT` (or the first option) when `pagination.initialPageSize` is not one of the options.
 *
 * Domains use `DEFAULT_PAGE_LIMITS` unless they need a different set (e.g. due to backend limits).
 * To override, define the set in the domain layer and use it for both the public prop type and this composable:
 *
 * @example
 * // domain/src/TransactionsOverview/constants.ts
 * export const TRANSACTIONS_PAGE_LIMITS = [10, 15, 20, 25, 30, 50, 100] as const;
 * export type TransactionsPageLimit = (typeof TRANSACTIONS_PAGE_LIMITS)[number];
 *
 * // vue/src/TransactionsOverview/types.ts
 * export interface TransactionsOverviewExternalProps extends UIElementProps, PaginationProps<TransactionsPageLimit> {}
 *
 * // vue/src/TransactionsOverview/composables/useTransactionsList.ts
 * const pageLimit = usePageLimit({ options: TRANSACTIONS_PAGE_LIMITS, pagination: () => props().pagination });
 */
export function usePageLimit<Limit extends number>({ options, pagination }: UsePageLimitOptions<Limit>) {
    const initialPageSize = pagination()?.initialPageSize;
    const fallback = isOption(options, DEFAULT_PAGE_LIMIT) ? DEFAULT_PAGE_LIMIT : options[0];

    if (initialPageSize !== undefined && !isOption(options, initialPageSize)) {
        console.warn(
            `pagination.initialPageSize "${initialPageSize}" is not supported. Falling back to ${fallback}. Supported values: ${options.join(', ')}.`
        );
    }

    return {
        initialLimit: isOption(options, initialPageSize) ? initialPageSize : fallback,
        limitOptions: computed(() => (pagination()?.allowPageSizeSelection !== false ? options : undefined)),
    } as const;
}

export default usePageLimit;
