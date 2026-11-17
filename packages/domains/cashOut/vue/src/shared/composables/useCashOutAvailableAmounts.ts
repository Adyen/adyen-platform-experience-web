import { computed, shallowRef, watch, type ShallowRef } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { EMPTY_OBJECT } from '@integration-components/utils';
import type { ICashOutAmount, ICashOutAvailableAmounts, ISessionAccount } from '@integration-components/types';

type Endpoints = ReturnType<typeof useConfigContext>['endpoints'];
type AvailableAmountsEndpoint = NonNullable<Endpoints['getCashOutAvailableAmounts']>;
type AccountsEndpoint = NonNullable<Endpoints['getAccounts']>;

type CachedAvailableAmounts = {
    amounts: ShallowRef<ICashOutAvailableAmounts | undefined>;
    // The account holder of the session, once known; `null` when the session is for a balance account, which has nothing to pick from.
    accountHolderKey?: string | null;
    isLoading: boolean;
    // Only the latest request may set the amounts, so an earlier one arriving after it doesn't replace them.
    latestRequest: number;
};

// Shared by the components of a session, like the balance accounts, so a component mounting later, such as the request in the
// Overview's modal, doesn't request them again, and a refresh in one of them updates them all.
const cache = new WeakMap<AvailableAmountsEndpoint, CachedAvailableAmounts>();

const cachedFor = (endpoint: AvailableAmountsEndpoint) => {
    let cached = cache.get(endpoint);
    if (!cached) {
        cached = { amounts: shallowRef(), isLoading: false, latestRequest: 0 };
        cache.set(endpoint, cached);
    }
    return cached;
};

const getAccountHolderKey = async (getAccounts: AccountsEndpoint, cached: CachedAvailableAmounts) => {
    if (cached.accountHolderKey === undefined) {
        const { data } = await getAccounts(EMPTY_OBJECT);
        cached.accountHolderKey = data.find(({ accountType }: ISessionAccount) => accountType === 'BalanceAccountHolder')?.accountKey ?? null;
    }
    return cached.accountHolderKey;
};

// Not aborted when a component unmounts, as the other components of the session may wait for it.
const load = (endpoints: { getAccounts: AccountsEndpoint; getCashOutAvailableAmounts: AvailableAmountsEndpoint }, cached: CachedAvailableAmounts) => {
    const request = ++cached.latestRequest;
    cached.isLoading = true;
    getAccountHolderKey(endpoints.getAccounts, cached)
        .then(accountKey => {
            if (!accountKey) return;
            return endpoints.getCashOutAvailableAmounts(EMPTY_OBJECT, { path: { accountKey } }).then(amounts => {
                if (request === cached.latestRequest) cached.amounts.value = amounts;
            });
        })
        // The amounts only add to the balance accounts to pick from, so a failure leaves the previous ones, or none.
        .catch(() => {})
        .finally(() => {
            if (request === cached.latestRequest) cached.isLoading = false;
        });
};

/**
 * What each balance account of the account holder of the session can cash out, by balance account id. The account of the session
 * comes from `GET accounts`, requested at the same time as the balance accounts; the amounts only for an account holder, as a
 * session for a balance account has nothing to pick from. Another component of the session that already loaded them shares them.
 *
 * The amounts only add to the balance accounts to pick from, so a failure leaves them out instead of being reported.
 */
export const useCashOutAvailableAmounts = () => {
    const config = useConfigContext();
    const endpoints = computed(() => {
        const { getAccounts, getCashOutAvailableAmounts } = config.endpoints;
        return getAccounts && getCashOutAvailableAmounts ? { getAccounts, getCashOutAvailableAmounts } : undefined;
    });
    const cached = computed(() => (endpoints.value ? cachedFor(endpoints.value.getCashOutAvailableAmounts) : undefined));

    watch(
        endpoints,
        value => {
            const current = value && cachedFor(value.getCashOutAvailableAmounts);
            if (value && current && current.accountHolderKey !== null && !current.amounts.value && !current.isLoading) load(value, current);
        },
        { immediate: true }
    );

    // The previous amounts stay while new ones load, so the balance accounts don't lose them on a refresh. A balance account the API
    // has no amount for is left out, so it shows none.
    const availableAmounts = computed(() => {
        const amounts = new Map<string, ICashOutAmount>();
        for (const { balanceAccountId, availableForCashOut } of cached.value?.amounts.value?.balanceAccounts ?? []) {
            // The type requires the amount, but the API may still send none.
            const amount = availableForCashOut as ICashOutAmount | null | undefined;
            if (amount) amounts.set(balanceAccountId, amount);
        }
        return amounts;
    });

    // Without the endpoints, for a session for a balance account, or when the amounts failed to load, there are none at all.
    const hasAvailableAmounts = computed(() => cached.value?.amounts.value !== undefined);

    const refreshAvailableAmounts = () => {
        if (endpoints.value && cached.value && cached.value.accountHolderKey !== null) load(endpoints.value, cached.value);
    };

    return { availableAmounts, hasAvailableAmounts, refreshAvailableAmounts } as const;
};
