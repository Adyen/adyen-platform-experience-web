import { computed, onScopeDispose, toValue, watch, type MaybeRefOrGetter } from 'vue';
import type { AdyenPlatformExperienceError } from '@integration-components/core';
import { useConfigContext } from '@integration-components/core/vue';
import { useAsyncRequest } from '@integration-components/composables-vue/useAsyncRequest';
import { CASH_OUT_FEES_DEBOUNCE_MS } from '@integration-components/cashOut/domain';
import type { ICashOutAmount, ICashOutFees } from '@integration-components/types';
import { useReportErrors } from '../../shared/composables/useReportErrors';

type CashOutFeesOptions = {
    /** The account key of the balance account, as the balance accounts endpoint returns it. */
    accountKey: MaybeRefOrGetter<string | undefined>;
    /** The amount to cash out, or `undefined` while there is no valid amount to get the fees of. */
    amount: MaybeRefOrGetter<ICashOutAmount | undefined>;
};

/** The fees of cashing out `amount`, fetched once the amount stops changing. */
export const useCashOutFees = ({ accountKey, amount }: CashOutFeesOptions) => {
    const config = useConfigContext();
    const request = useAsyncRequest<ICashOutFees>();
    const getCashOutFees = computed(() => config.endpoints.getCashOutFees);
    let debounceTimeout: ReturnType<typeof setTimeout> | undefined;
    let requestedAccountKey: string | undefined;

    const cancel = () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = undefined;
        request.abort();
    };

    const fetchFees = (key: string, { value, currency }: ICashOutAmount) => {
        const endpoint = getCashOutFees.value;
        if (!endpoint) return;

        requestedAccountKey = key;
        void request.execute(signal => endpoint({ signal }, { path: { accountKey: key }, query: { amount: value, currency } }));
    };

    // By its value and currency, as the same amount can be given again as another object, such as when the available amounts are
    // loaded again and tell the same: its fees are already known then.
    watch(
        [() => toValue(accountKey), () => toValue(amount)?.value, () => toValue(amount)?.currency],
        ([key]) => {
            const nextAmount = toValue(amount);
            cancel();
            // Fees of a previous amount must not show while the next ones load.
            request.data.value = undefined;
            request.error.value = undefined;

            if (!key || !nextAmount) return;

            // The first amount of a balance account is set by the component rather than typed, so there is nothing to wait for.
            if (key !== requestedAccountKey) return fetchFees(key, nextAmount);

            debounceTimeout = setTimeout(() => fetchFees(key, nextAmount), CASH_OUT_FEES_DEBOUNCE_MS);
        },
        { immediate: true }
    );

    onScopeDispose(cancel);
    useReportErrors(request.error);

    return {
        fees: request.data,
        // The HTTP layer throws AdyenPlatformExperienceError at runtime, whatever type the request composables declare.
        feesError: computed(() => request.error.value as AdyenPlatformExperienceError | undefined),
        isFetchingFees: request.isLoading,
    } as const;
};
