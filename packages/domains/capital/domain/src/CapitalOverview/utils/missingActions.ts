import type { MissingActionsPollingConfig } from './polling';
import type { IGrantsResponseDTO, IMissingAction, IMissingActionType } from '@integration-components/types';

export const getMissingActions = (grantsResponseData: IGrantsResponseDTO | undefined, grantId: string, initialMissingActions: IMissingAction[]) => {
    const grant = grantsResponseData?.data?.find(grant => grant.id === grantId);
    return grant?.missingActions ?? initialMissingActions;
};

export const getMissingActionsMetadata = (missingActions: readonly IMissingAction[], completedActions: readonly IMissingActionType[]) => {
    const primaryAction = missingActions.find(action => !completedActions.includes(action.type));
    return {
        areActionsCompleted: primaryAction === undefined,
        primaryActionType: primaryAction?.type,
    };
};

export const shouldPollMissingActions = (missingActions: readonly IMissingAction[]) => missingActions.length <= 1;

export const getNextPollingInterval = (
    missingActions: readonly IMissingAction[],
    pollCount: number,
    elapsedMs: number,
    { initialIntervalMs, backoffMultiplier, maxDurationMs }: MissingActionsPollingConfig
): number | undefined => {
    const nextIntervalMs = initialIntervalMs * Math.pow(backoffMultiplier, Math.max(0, pollCount));
    const willExceedDuration = elapsedMs + nextIntervalMs >= maxDurationMs;
    return missingActions.length > 1 || willExceedDuration ? undefined : nextIntervalMs;
};
