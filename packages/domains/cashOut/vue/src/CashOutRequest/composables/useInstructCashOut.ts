import { computed } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { useAsyncRequest } from '@integration-components/composables-vue/useAsyncRequest';
import type { ICashOutAmount, ICashOutResponse } from '@integration-components/types';

type InstructCashOutParams = {
    balanceAccountId: string;
    amount: ICashOutAmount;
    transferInstrumentId: string;
};

export const useInstructCashOut = () => {
    const config = useConfigContext();
    const request = useAsyncRequest<ICashOutResponse>();
    const instructCashOutEndpoint = computed(() => config.endpoints.instructCashOut);

    /** Resolves with the instructed cashOut, or with `undefined` when it fails. */
    const instructCashOut = async ({ balanceAccountId, amount, transferInstrumentId }: InstructCashOutParams) => {
        const endpoint = instructCashOutEndpoint.value;
        if (!endpoint) return undefined;

        // The cashOut endpoints take the balance account id as their account key.
        return request.execute(signal =>
            endpoint(
                {
                    body: { amount: amount.value, currency: amount.currency, counterparty: { transferInstrumentId } },
                    contentType: 'application/json',
                    signal,
                },
                { path: { accountKey: balanceAccountId } }
            )
        );
    };

    return {
        canInstructCashOut: computed(() => !!instructCashOutEndpoint.value),
        instructCashOut,
        isInstructing: request.isLoading,
    } as const;
};
