import { computed } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { useAsyncRequest } from '@integration-components/composables-vue';
import type { IGrant } from '@integration-components/types';
import { EMPTY_OBJECT } from '@integration-components/utils';

export function useRequestFunds() {
    const config = useConfigContext();
    const requestState = useAsyncRequest<IGrant>();
    const requestFunds = computed(() => config.endpoints.requestFunds);

    const sendRequestFundsRequest = (offerId: string, renewsGrantId?: string) => {
        const request = requestFunds.value;
        if (!request) return;

        return requestState.execute(signal =>
            request(
                {
                    body: renewsGrantId ? { renewsGrantId } : EMPTY_OBJECT,
                    contentType: 'application/json',
                    signal,
                },
                { path: { grantOfferId: offerId } }
            )
        );
    };

    return {
        data: requestState.data,
        error: requestState.error,
        isLoading: requestState.isLoading,
        requestFunds: sendRequestFundsRequest,
    } as const;
}
