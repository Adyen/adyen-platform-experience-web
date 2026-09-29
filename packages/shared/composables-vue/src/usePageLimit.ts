import { computed } from 'vue';
import { DEFAULT_PAGE_LIMIT } from '@integration-components/utils';

export interface UsePageLimitOptions<Limit extends number> {
    options: readonly [Limit, ...Limit[]];
    preferredLimit: () => number | undefined;
    allowLimitSelection: () => boolean | undefined;
}

/**
 * Resolves the initial page limit and the selectable limit options for a paginated list.
 * Falls back to `DEFAULT_PAGE_LIMIT` (or the first option) when the preferred limit is not one of the options.
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
 * const pageLimit = usePageLimit({
 *     options: TRANSACTIONS_PAGE_LIMITS,
 *     preferredLimit: () => props().preferredLimit,
 *     allowLimitSelection: () => props().allowLimitSelection,
 * });
 */
export function usePageLimit<Limit extends number>({ options, preferredLimit, allowLimitSelection }: UsePageLimitOptions<Limit>) {
    const isOption = (limit: number | undefined): limit is Limit => options.includes(limit as Limit);
    const preferred = preferredLimit();
    const fallback = isOption(DEFAULT_PAGE_LIMIT) ? DEFAULT_PAGE_LIMIT : options[0];

    if (preferred !== undefined && !isOption(preferred)) {
        console.warn(`preferredLimit "${preferred}" is not supported. Falling back to ${fallback}. Supported values: ${options.join(', ')}.`);
    }

    return {
        initialLimit: isOption(preferred) ? preferred : fallback,
        limitOptions: computed(() => (allowLimitSelection() !== false ? options : undefined)),
    } as const;
}

export default usePageLimit;
