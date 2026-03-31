import { IGrant, IMissingAction } from '../../../../../types';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { useFetch } from '../../../../../hooks/useFetch';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { EMPTY_OBJECT } from '../../../../../utils';

const MAX_POLL_COUNT = 60;
const POLL_INTERVAL_MS = 1000;

type UseMissingActionsPollingParams = {
    grantId: string;
    initialMissingActions: IMissingAction[];
};

// TODO: Remove this hook when AnaCredit and SignTOS resolve at the same time.
// Polls for missing actions because AnaCredit resolves slower than SignTOS, allowing both to be rendered together.
export const useMissingActionsPolling = ({ grantId, initialMissingActions }: UseMissingActionsPollingParams) => {
    const { getGrants } = useConfigContext().endpoints;
    const shouldPoll = initialMissingActions.length <= 1;
    const pollCountRef = useRef(0);
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

        const grant = data?.data?.find((grant: IGrant) => grant.id === grantId);
        const currentMissingActions = grant?.missingActions ?? initialMissingActions;
        setMissingActions(currentMissingActions);

        if (currentMissingActions.length > 1 || pollCountRef.current >= MAX_POLL_COUNT) {
            setIsPollingComplete(true);
            return;
        }

        const timeoutId = setTimeout(() => {
            refetch();
        }, POLL_INTERVAL_MS);

        return () => clearTimeout(timeoutId);
    }, [data, isFetching, refetch, grantId, isPollingComplete, shouldPoll, initialMissingActions]);

    const forcePollingComplete = useCallback(() => setIsPollingComplete(true), []);

    return { missingActions, isPollingComplete, forcePollingComplete };
};
