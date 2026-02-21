import { useCallback, useEffect, useMemo, useRef } from 'preact/hooks';
import { TRANSACTION_DATE_RANGE_DEFAULT_TIMESTAMPS } from '../constants';
import { AtomicValue, useAtom, useMolecule } from '../../../../hooks/atoms';
import { getDateRangeTimestamps } from '../../../internal/Calendar/calendar/timerange/utils';
import type { IAmount, IBalanceAccountBase, ITransactionCategory, ITransactionStatus } from '../../../../types';
import type { RangeTimestamps } from '../../../internal/Calendar/calendar/timerange';
import type { TransactionOverviewComponentProps } from '../../../types';

const DEFAULT_CATEGORIES: readonly ITransactionCategory[] = [];
const DEFAULT_CURRENCIES: readonly IAmount['currency'][] = [];
const DEFAULT_STATUSES: readonly ITransactionStatus[] = ['Booked'];

export type UseTransactionsFiltersProps = Pick<TransactionOverviewComponentProps, 'onFiltersChanged'>;

export const useTransactionsFilters = (props?: UseTransactionsFiltersProps) => {
    const equals = useCallback(<T>(a: T, b: T) => String(a) === String(b), []);
    const delay = 1000;

    const balanceAccount = useAtom<Readonly<IBalanceAccountBase>>({ deferredInitialValue: true, delay });
    const statuses = useAtom({ initialValue: DEFAULT_STATUSES, equals, delay });
    const categories = useAtom({ initialValue: DEFAULT_CATEGORIES, equals, delay });
    const currencies = useAtom({ initialValue: DEFAULT_CURRENCIES, equals, delay });
    const createdDate = useAtom<RangeTimestamps>({ initialValue: TRANSACTION_DATE_RANGE_DEFAULT_TIMESTAMPS, delay });
    const paymentPspReference = useAtom<string>({ delay });

    const insightsFilters = useMolecule({
        members: useMemo(() => ({ balanceAccount, createdDate }), [balanceAccount, createdDate]),
    });

    const transactionsFilters = useMolecule({
        members: useMemo(
            () => ({ balanceAccount, categories, createdDate, currencies, paymentPspReference, statuses }),
            [balanceAccount, categories, createdDate, currencies, paymentPspReference, statuses]
        ),
    });

    const baseFiltersQuery = useMemo(() => {
        const { balanceAccount, createdDate } = transactionsFilters.value;
        const { from, to } = getDateRangeTimestamps(createdDate, Date.now(), balanceAccount?.timeZone);
        return {
            balanceAccountId: balanceAccount?.id,
            createdSince: new Date(from).toISOString(),
            createdUntil: new Date(to).toISOString(),
        } as const;
    }, [transactionsFilters.value]);

    // prettier-ignore
    const insightsFiltersQuery = useMemo(
        () => ({ ...baseFiltersQuery }) as const,
        [insightsFilters.value, baseFiltersQuery]
    );

    const transactionsFiltersQuery = useMemo(() => {
        const { categories, currencies, paymentPspReference, statuses } = transactionsFilters.value;
        return {
            ...baseFiltersQuery,
            categories: categories as (typeof categories)[number][],
            currencies: currencies as (typeof currencies)[number][],
            statuses: statuses as (typeof statuses)[number][],
            paymentPspReference: paymentPspReference,
        } as const;
    }, [transactionsFilters.value, baseFiltersQuery]);

    const transactionsFilterParams = useMemo(() => {
        const { categories, currencies, paymentPspReference, statuses } = transactionsFilters.value;
        return {
            ...baseFiltersQuery,
            categories: String(categories) || undefined,
            currencies: String(currencies) || undefined,
            statuses: String(statuses) || undefined,
            paymentPspReference,
        } as const;
    }, [transactionsFilters.value, baseFiltersQuery]);

    const reset = useCallback(() => transactionsFilters.reset(AtomicValue.INITIAL), [transactionsFilters.reset]);

    const cachedTransactionsFilterParams = useRef(transactionsFilterParams);

    useEffect(() => {
        if (cachedTransactionsFilterParams.current !== transactionsFilterParams) {
            cachedTransactionsFilterParams.current = transactionsFilterParams;
            props?.onFiltersChanged?.(transactionsFilterParams);
        }
    }, [transactionsFilterParams, props?.onFiltersChanged]);

    return {
        // atoms
        balanceAccount,
        categories,
        createdDate,
        currencies,
        paymentPspReference,
        statuses,

        // computations
        canReset: !transactionsFilters.pristine || transactionsFilters.stale,
        loading: transactionsFilters.stale,
        transactionsFilterParams,
        transactionsFiltersQuery,
        insightsFiltersQuery,

        // functions
        reset,
    } as const;
};

export default useTransactionsFilters;
