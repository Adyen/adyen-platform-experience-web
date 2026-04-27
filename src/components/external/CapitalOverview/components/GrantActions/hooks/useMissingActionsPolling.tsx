import { IGrant, IMissingAction } from '../../../../../../types';
import { useConfigContext } from '../../../../../../core/ConfigContext';
import { useFetch } from '../../../../../../hooks/useFetch';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { EMPTY_OBJECT } from '../../../../../../utils';
import { usePollingConfig } from './usePollingConfig';

type UseMissingActionsPollingParams = {
    grantId: string;
    initialMissingActions: IMissingAction[];
};

// Polls for missing actions because AnaCredit resolves slower than SignTOS, allowing both to be rendered together.
export const useMissingActionsPolling = ({ grantId, initialMissingActions }: UseMissingActionsPollingParams) => {
    const { getGrants } = useConfigContext().endpoints;
    const {
        pollingConfig: {
            missingActions: { initialIntervalMs, maxDurationMs, backoffMultiplier },
        },
    } = usePollingConfig();
    const shouldPoll = initialMissingActions.length <= 1;
    const pollCountRef = useRef(0);
    const pollStartTimeRef = useRef(0);
    const [isPollingComplete, setIsPollingComplete] = useState(!shouldPoll);
    const [missingActions, setMissingActions] = useState<IMissingAction[]>(initialMissingActions);

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

        const grant = data?.data?.find((grant: IGrant) => grant.id === grantId);
        const currentMissingActions = grant?.missingActions ?? initialMissingActions;
        setMissingActions(currentMissingActions);

        const nextInterval = initialIntervalMs * Math.pow(backoffMultiplier, Math.max(0, pollCountRef.current));
        const elapsedTime = Date.now() - pollStartTimeRef.current;
        const nextElapsedTime = elapsedTime + nextInterval;

        const willExceedDuration = nextElapsedTime >= maxDurationMs;
        const hasMultipleActions = currentMissingActions.length > 1;

        if (hasMultipleActions || willExceedDuration) {
            setIsPollingComplete(true);
            return;
        }

        const timeoutId = setTimeout(() => {
            refetch();
        }, nextInterval);

        return () => clearTimeout(timeoutId);
    }, [
        data,
        isFetching,
        refetch,
        grantId,
        isPollingComplete,
        shouldPoll,
        initialMissingActions,
        initialIntervalMs,
        backoffMultiplier,
        maxDurationMs,
    ]);

    const forcePollingComplete = useCallback(() => setIsPollingComplete(true), []);

    return { missingActions, isPollingComplete, forcePollingComplete };
};
