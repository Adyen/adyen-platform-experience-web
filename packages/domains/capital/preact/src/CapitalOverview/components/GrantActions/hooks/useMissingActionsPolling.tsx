import { IMissingAction } from '@integration-components/types';
import { useConfigContext } from '@integration-components/core/preact';
import { useFetch } from '@integration-components/hooks-preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { EMPTY_OBJECT } from '@integration-components/utils';
import { usePollingConfig } from './usePollingConfig';
import { getMissingActions, getNextPollingInterval, shouldPollMissingActions } from '@integration-components/capital/domain';

type UseMissingActionsPollingParams = {
    grantId: string;
    initialMissingActions: IMissingAction[];
};

// Polls for missing actions because AnaCredit resolves slower than SignTOS, allowing both to be rendered together.
export const useMissingActionsPolling = ({ grantId, initialMissingActions }: UseMissingActionsPollingParams) => {
    const { getGrants } = useConfigContext().endpoints;
    const {
        pollingConfig: { missingActions: missingActionsPollingConfig },
    } = usePollingConfig();
    const shouldPoll = shouldPollMissingActions(initialMissingActions);
    const pollCountRef = useRef(0);
    const pollStartTimeRef = useRef(0);
    const [isPollingComplete, setIsPollingComplete] = useState(!shouldPoll);
    const [missingActions, setMissingActions] = useState(initialMissingActions);

    const { data, isFetching, refetch } = useFetch({
        fetchOptions: {
            enabled: false,
            onSuccess: useCallback(() => {
                pollCountRef.current += 1;
            }, []),
        },
        queryFn: useCallback(async () => getGrants?.(EMPTY_OBJECT), [getGrants]),
    });

    useEffect(() => {
        pollCountRef.current = 0;
        pollStartTimeRef.current = 0;
        setIsPollingComplete(!shouldPoll);
        setMissingActions(initialMissingActions);
    }, [grantId, initialMissingActions, shouldPoll]);

    useEffect(() => {
        if (!shouldPoll || isPollingComplete || isFetching) return;

        if (pollStartTimeRef.current === 0) {
            pollStartTimeRef.current = Date.now();
        }

        const currentMissingActions = getMissingActions(data, grantId, initialMissingActions);
        setMissingActions(currentMissingActions);

        const elapsedTime = Date.now() - pollStartTimeRef.current;
        const nextPollingInterval = getNextPollingInterval(currentMissingActions, pollCountRef.current, elapsedTime, missingActionsPollingConfig);

        if (!nextPollingInterval) {
            setIsPollingComplete(true);
            return;
        }

        const timeoutId = setTimeout(() => {
            refetch();
        }, nextPollingInterval);

        return () => clearTimeout(timeoutId);
    }, [data, isFetching, refetch, grantId, isPollingComplete, shouldPoll, initialMissingActions, missingActionsPollingConfig]);

    const forcePollingComplete = useCallback(() => setIsPollingComplete(true), []);

    return { missingActions, isPollingComplete, forcePollingComplete };
};
