import { IGrant, IMissingAction } from '../../../../../../types';
import { useConfigContext } from '../../../../../../core/ConfigContext';
import { useFetch } from '../../../../../../hooks/useFetch';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { EMPTY_OBJECT } from '../../../../../../utils';
import { usePollingConfig } from '../../../../../../config/capital/usePollingConfig';

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
    const shouldPoll = initialMissingActions.length <= 1;
    const pollCountRef = useRef(0);
    const pollStartTimeRef = useRef(0);
    const [isPollingComplete, setIsPollingComplete] = useState(!shouldPoll);
    const [missingActions, setMissingActions] = useState<IMissingAction[]>(initialMissingActions);

    const { data, isFetching, refetch } = useFetch({
        fetchOptions: {
            enabled: shouldPoll,
            onSuccess: useCallback(() => {
                pollCountRef.current += 1;
            }, []),
        },
        queryFn: useCallback(async () => getGrants?.(EMPTY_OBJECT), [getGrants]),
    });

    useEffect(() => {
        if (!shouldPoll || isPollingComplete || isFetching) return;

        if (pollStartTimeRef.current === 0) {
            pollStartTimeRef.current = Date.now();
        }

        const grant = data?.data?.find((grant: IGrant) => grant.id === grantId);
        const currentMissingActions = grant?.missingActions ?? initialMissingActions;
        setMissingActions(currentMissingActions);

        const elapsedTime = Date.now() - pollStartTimeRef.current;
        const hasExceededDuration = elapsedTime >= missingActionsPollingConfig.maxDurationMs;
        const hasMultipleActions = currentMissingActions.length > 1;

        if (hasMultipleActions || hasExceededDuration) {
            setIsPollingComplete(true);
            return;
        }

        const calculateNextInterval = () => {
            if (missingActionsPollingConfig.strategy === 'exponentialBackoff') {
                return missingActionsPollingConfig.initialIntervalMs * Math.pow(missingActionsPollingConfig.backoffMultiplier, pollCountRef.current);
            }
            return missingActionsPollingConfig.initialIntervalMs;
        };

        const nextInterval = calculateNextInterval();

        const timeoutId = setTimeout(() => {
            refetch();
        }, nextInterval);

        return () => clearTimeout(timeoutId);
    }, [data, isFetching, refetch, grantId, isPollingComplete, shouldPoll, initialMissingActions, missingActionsPollingConfig]);

    const forcePollingComplete = useCallback(() => setIsPollingComplete(true), []);

    return { missingActions, isPollingComplete, forcePollingComplete };
};
