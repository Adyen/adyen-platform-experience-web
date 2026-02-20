import { INITIAL_FILTERS } from '../constants';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import { useAtom, useMolecule } from '../../../../hooks/atoms';
import { getDateRangeTimestamps } from '../../../internal/Calendar/calendar/timerange/utils';
import type { RangeTimestamps } from '../../../internal/Calendar/calendar/timerange';
import type { IBalanceAccountBase } from '../../../../types';
import type { TransactionsFilters } from '../types';

export interface TransactionsFilterParams {
    balanceAccountId: string | undefined;
    categories: string | undefined;
    createdSince: string;
    createdUntil: string;
    currencies: string | undefined;
    paymentPspReference: string | undefined;
    statuses: string | undefined;
}

export interface TransactionsListQueryParams {
    balanceAccountId: string;
    categories: TransactionsFilters['categories'][number][];
    createdSince: string;
    createdUntil: string;
    currencies: TransactionsFilters['currencies'][number][];
    paymentPspReference: string | undefined;
    statuses: TransactionsFilters['statuses'][number][];
}

export type TransactionsInsightsQueryParams = Pick<TransactionsListQueryParams, 'balanceAccountId' | 'createdSince' | 'createdUntil'>;

export interface UseTransactionsFiltersProps {
    onFiltersChange?: (filters: Readonly<TransactionsFilters>) => void;
}

const arrayStringEquals = <T>(a: readonly T[], b: readonly T[]) => String(a) === String(b);

const useTransactionsFilters = ({ onFiltersChange }: UseTransactionsFiltersProps = {}) => {
    const balanceAccount = useAtom<Readonly<IBalanceAccountBase> | undefined>({ deferredInitialValue: true });
    const statuses = useAtom({ initialValue: INITIAL_FILTERS.statuses, equals: arrayStringEquals });
    const categories = useAtom({ initialValue: INITIAL_FILTERS.categories, equals: arrayStringEquals });
    const currencies = useAtom({ initialValue: INITIAL_FILTERS.currencies, equals: arrayStringEquals });
    const createdDate = useAtom<RangeTimestamps>({ initialValue: INITIAL_FILTERS.createdDate });
    const paymentPspReference = useAtom({ initialValue: INITIAL_FILTERS.paymentPspReference });
    const insightsCurrency = useAtom<string>();

    // prettier-ignore
    const members = useMemo(
        () => ({ balanceAccount, statuses, categories, currencies, createdDate, paymentPspReference }),
        [balanceAccount, statuses, categories, currencies, createdDate, paymentPspReference]
    );

    const filters = useMolecule<TransactionsFilters>({ members });
    const filtersValue = filters.value;

    const listQueryParams = useMemo<TransactionsListQueryParams>(() => {
        const { balanceAccount, categories, createdDate, currencies, paymentPspReference, statuses } = filtersValue;
        const { from, to } = getDateRangeTimestamps(createdDate, Date.now(), balanceAccount?.timeZone);

        return {
            balanceAccountId: balanceAccount?.id!,
            categories: [...categories],
            createdSince: new Date(from).toISOString(),
            createdUntil: new Date(to).toISOString(),
            currencies: [...currencies],
            statuses: [...statuses],
            paymentPspReference,
        };
    }, [filtersValue]);

    const insightsQueryParams = useMemo<TransactionsInsightsQueryParams>(
        () => ({
            balanceAccountId: listQueryParams.balanceAccountId,
            createdSince: listQueryParams.createdSince,
            createdUntil: listQueryParams.createdUntil,
        }),
        [listQueryParams]
    );

    const filterParams = useMemo<TransactionsFilterParams>(
        () => ({
            balanceAccountId: listQueryParams.balanceAccountId || undefined,
            categories: String(listQueryParams.categories) || undefined,
            createdSince: listQueryParams.createdSince,
            createdUntil: listQueryParams.createdUntil,
            currencies: String(listQueryParams.currencies) || undefined,
            paymentPspReference: listQueryParams.paymentPspReference,
            statuses: String(listQueryParams.statuses) || undefined,
        }),
        [listQueryParams]
    );

    const cachedBalanceAccount = useRef(filtersValue.balanceAccount);

    useEffect(() => {
        const balanceAccount = filtersValue.balanceAccount;

        if (cachedBalanceAccount.current !== balanceAccount) {
            cachedBalanceAccount.current = balanceAccount;
            currencies.reset();
        }
    }, [filtersValue, currencies.reset]);

    useEffect(() => {
        onFiltersChange?.(filtersValue);
    }, [onFiltersChange, filtersValue]);

    return {
        filters,
        filterParams,
        insightsQueryParams,
        listQueryParams,
        balanceAccount,
        statuses,
        categories,
        currencies,
        createdDate,
        paymentPspReference,
        insightsCurrency,
    } as const;
};

export default useTransactionsFilters;
