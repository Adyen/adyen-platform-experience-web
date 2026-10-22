import { computed, onScopeDispose, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';
import type { AdyenPlatformExperienceError } from '@integration-components/core';
import { useConfigContext } from '@integration-components/core/vue';
import { useAsyncRequest } from '@integration-components/composables-vue/useAsyncRequest';
import { CASH_OUT_FEES_DEBOUNCE_MS } from '@integration-components/cashOut/domain';
import type { ICashOutAmount, ICashOutFees } from '@integration-components/types';

type CashOutFeesOptions = {
    balanceAccountId: MaybeRefOrGetter<string | undefined>;
    /** The amount to cash out, or `undefined` while there is no valid amount to get the fees of. */
    amount: MaybeRefOrGetter<ICashOutAmount | undefined>;
};

/** The fees of cashing out `amount`, fetched once the amount stops changing. */
export const useCashOutFees = ({ balanceAccountId, amount }: CashOutFeesOptions) => {
    const config = useConfigContext();
    const request = useAsyncRequest<ICashOutFees>();
    const getCashOutFees = computed(() => config.endpoints.getCashOutFees);
    const isPending = ref(false);
    let debounceTimeout: ReturnType<typeof setTimeout> | undefined;
    let requestedBalanceAccountId: string | undefined;

    const cancel = () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = undefined;
        isPending.value = false;
        request.abort();
    };

    const fetchFees = (id: string, { value, currency }: ICashOutAmount) => {
        const endpoint = getCashOutFees.value;
        isPending.value = false;
        if (!endpoint) return;

        requestedBalanceAccountId = id;
        // The cashOut endpoints take the balance account id as their account key.
        void request.execute(signal => endpoint({ signal }, { path: { accountKey: id }, query: { amount: value, currency } }));
    };

    watch(
        [() => toValue(balanceAccountId), () => toValue(amount)],
        ([id, nextAmount]) => {
            cancel();
            // Fees of a previous amount must not show while the next ones load.
            request.data.value = undefined;
            request.error.value = undefined;

            if (!id || !nextAmount) return;

            // The first amount of a balance account is set by the component rather than typed, so there is nothing to wait for.
            if (id !== requestedBalanceAccountId) return fetchFees(id, nextAmount);

            isPending.value = true;
            debounceTimeout = setTimeout(() => fetchFees(id, nextAmount), CASH_OUT_FEES_DEBOUNCE_MS);
        },
        { immediate: true }
    );

    onScopeDispose(cancel);

    return {
        fees: request.data,
        // The HTTP layer throws AdyenPlatformExperienceError at runtime, whatever type the request composables declare.
        feesError: computed(() => request.error.value as AdyenPlatformExperienceError | undefined),
        isFetchingFees: computed(() => isPending.value || request.isLoading.value),
    } as const;
};
