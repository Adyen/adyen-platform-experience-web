import { computed, onScopeDispose, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';
import { getMissingActions, getNextPollingInterval, shouldPollMissingActions } from '@integration-components/capital/domain';
import { useConfigContext } from '@integration-components/core/vue';
import type { IMissingAction } from '@integration-components/types';
import { EMPTY_OBJECT, isFunction } from '@integration-components/utils';
import { usePollingConfig } from './usePollingConfig';

type UseMissingActionsPollingParams = {
    grantId: MaybeRefOrGetter<string>;
    initialMissingActions: MaybeRefOrGetter<IMissingAction[]>;
};

// Polls for missing actions because AnaCredit resolves slower than SignToS, allowing both to be rendered together.
export const useMissingActionsPolling = ({ grantId, initialMissingActions }: UseMissingActionsPollingParams) => {
    const config = useConfigContext();
    const { fetchPollingConfig, pollingConfig } = usePollingConfig();
    const resolvedGrantId = computed(() => toValue(grantId));
    const resolvedInitialMissingActions = computed(() => toValue(initialMissingActions));
    const getGrants = computed(() => config.endpoints.getGrants);
    const shouldPoll = computed(() => shouldPollMissingActions(resolvedInitialMissingActions.value));
    const missingActions = ref<IMissingAction[]>(resolvedInitialMissingActions.value);
    const isPollingComplete = ref(!shouldPoll.value);
    const isFetching = ref(false);
    let pollCount = 0;
    let pollStartTime = 0;
    let pollingTimeout: ReturnType<typeof setTimeout> | undefined;

    const clearPollingTimeout = () => {
        if (pollingTimeout) {
            clearTimeout(pollingTimeout);
            pollingTimeout = undefined;
        }
    };

    const forcePollingComplete = () => {
        clearPollingTimeout();
        isPollingComplete.value = true;
    };

    const pollMissingActions = async () => {
        const endpoint = getGrants.value;

        if (!isFunction(endpoint)) {
            forcePollingComplete();
            return;
        }

        isFetching.value = true;

        try {
            const grantsResponse = await endpoint(EMPTY_OBJECT);
            pollCount += 1;
            missingActions.value = getMissingActions(grantsResponse, resolvedGrantId.value, resolvedInitialMissingActions.value);

            const elapsedTime = Date.now() - pollStartTime;
            const nextPollingInterval = getNextPollingInterval(missingActions.value, pollCount, elapsedTime, pollingConfig.value.missingActions);

            if (!nextPollingInterval) {
                isPollingComplete.value = true;
                return;
            }

            pollingTimeout = setTimeout(() => {
                void pollMissingActions();
            }, nextPollingInterval);
        } catch {
            forcePollingComplete();
        } finally {
            isFetching.value = false;
        }
    };

    const startPolling = () => {
        clearPollingTimeout();
        pollCount = 0;
        pollStartTime = 0;
        missingActions.value = resolvedInitialMissingActions.value;
        isPollingComplete.value = !shouldPoll.value;

        if (!shouldPoll.value) {
            return;
        }

        pollStartTime = Date.now();
        pollingTimeout = setTimeout(() => {
            void pollMissingActions();
        }, pollingConfig.value.missingActions.initialIntervalMs);
    };

    watch(
        [resolvedGrantId, resolvedInitialMissingActions, pollingConfig],
        () => {
            startPolling();
        },
        { immediate: true, deep: true }
    );

    void fetchPollingConfig();
    onScopeDispose(clearPollingTimeout);

    return { forcePollingComplete, isFetching, isPollingComplete, missingActions };
};
