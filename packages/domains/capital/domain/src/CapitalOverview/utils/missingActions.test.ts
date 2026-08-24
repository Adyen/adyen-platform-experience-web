import { describe, expect, test } from 'vitest';
import type { IGrantsResponseDTO } from '@integration-components/types';
import { PENDING_GRANT_WITH_MULTIPLE_ACTIONS, PENDING_GRANT_WITH_SINGLE_ACTION } from '../../../../mocks/mock-data/capital';
import { getMissingActions, getMissingActionsMetadata, getNextPollingInterval, shouldPollMissingActions } from './missingActions';

const pollingConfig = {
    initialIntervalMs: 100,
    backoffMultiplier: 2,
    maxDurationMs: 500,
};

describe('getMissingActions', () => {
    const initialActions = PENDING_GRANT_WITH_SINGLE_ACTION.missingActions!;

    test('returns missing actions for the provided grant id', () => {
        const response: IGrantsResponseDTO = { data: [PENDING_GRANT_WITH_MULTIPLE_ACTIONS] };
        const id = PENDING_GRANT_WITH_MULTIPLE_ACTIONS.id;
        expect(getMissingActions(response, id, initialActions)).toEqual(PENDING_GRANT_WITH_MULTIPLE_ACTIONS.missingActions);
    });

    test('returns initial missing actions when there is no grant that matches the provided id', () => {
        const response: IGrantsResponseDTO = { data: [PENDING_GRANT_WITH_MULTIPLE_ACTIONS] };
        const id = 'id';
        expect(getMissingActions(undefined, id, initialActions)).toEqual(initialActions);
        expect(getMissingActions(response, id, initialActions)).toEqual(initialActions);
    });
});

describe('getMissingActionsMetadata', () => {
    const actions = PENDING_GRANT_WITH_MULTIPLE_ACTIONS.missingActions!;

    test('marks the first incomplete action as primary action', () => {
        expect(getMissingActionsMetadata(actions, [])).toEqual({ areActionsCompleted: false, primaryActionType: 'AnaCredit' });
        expect(getMissingActionsMetadata(actions, ['AnaCredit'])).toEqual({ areActionsCompleted: false, primaryActionType: 'signToS' });
    });

    test('marks actions as completed when there is no missing action left', () => {
        expect(getMissingActionsMetadata(actions, ['AnaCredit', 'signToS'])).toEqual({
            areActionsCompleted: true,
            primaryActionType: undefined,
        });
    });
});

describe('shouldPollMissingActions', () => {
    test('enables polling only when there is zero or one missing action', () => {
        expect(shouldPollMissingActions([])).toBe(true);
        expect(shouldPollMissingActions(PENDING_GRANT_WITH_SINGLE_ACTION.missingActions!)).toBe(true);
        expect(shouldPollMissingActions(PENDING_GRANT_WITH_MULTIPLE_ACTIONS.missingActions!)).toBe(false);
    });
});

describe('getNextPollingInterval', () => {
    const singleAction = PENDING_GRANT_WITH_SINGLE_ACTION.missingActions!;
    const multipleActions = PENDING_GRANT_WITH_MULTIPLE_ACTIONS.missingActions!;

    test('return polling interval by applying exponential backoff', () => {
        expect(getNextPollingInterval(singleAction, -1, 0, pollingConfig)).toBe(100);
        expect(getNextPollingInterval(singleAction, 1, 100, pollingConfig)).toBe(200);
    });

    test('return no interval when multiple actions are found or the duration limit is reached', () => {
        expect(getNextPollingInterval(multipleActions, 0, 0, pollingConfig)).toBeUndefined();
        expect(getNextPollingInterval(singleAction, 2, 100, pollingConfig)).toBeUndefined();
    });
});
