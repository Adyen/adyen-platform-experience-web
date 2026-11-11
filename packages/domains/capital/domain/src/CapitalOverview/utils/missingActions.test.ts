import { describe, expect, test } from 'vitest';
import type { IGrantsResponse } from '@integration-components/types';
import { ACTIONS_LOAN, SINGLE_ACTION_LOAN } from '../../../../mocks/mock-data';
import { getMissingActions, getMissingActionsMetadata, getNextPollingInterval, shouldPollMissingActions } from './missingActions';

const pollingConfig = {
    initialIntervalMs: 100,
    backoffMultiplier: 2,
    maxDurationMs: 500,
};

describe('getMissingActions', () => {
    const initialActions = SINGLE_ACTION_LOAN.missingActions!;

    test('returns missing actions for the provided grant id', () => {
        const response: IGrantsResponse = { data: [ACTIONS_LOAN] };
        const id = ACTIONS_LOAN.id;
        expect(getMissingActions(response, id, initialActions)).toEqual(ACTIONS_LOAN.missingActions);
    });

    test('returns initial missing actions when there is no grant that matches the provided id', () => {
        const response: IGrantsResponse = { data: [ACTIONS_LOAN] };
        const id = 'id';
        expect(getMissingActions(undefined, id, initialActions)).toEqual(initialActions);
        expect(getMissingActions(response, id, initialActions)).toEqual(initialActions);
    });
});

describe('getMissingActionsMetadata', () => {
    const actions = ACTIONS_LOAN.missingActions!;

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
        expect(shouldPollMissingActions(SINGLE_ACTION_LOAN.missingActions!)).toBe(true);
        expect(shouldPollMissingActions(ACTIONS_LOAN.missingActions!)).toBe(false);
    });
});

describe('getNextPollingInterval', () => {
    const singleAction = SINGLE_ACTION_LOAN.missingActions!;
    const multipleActions = ACTIONS_LOAN.missingActions!;

    test('return polling interval by applying exponential backoff', () => {
        expect(getNextPollingInterval(singleAction, -1, 0, pollingConfig)).toBe(100);
        expect(getNextPollingInterval(singleAction, 1, 100, pollingConfig)).toBe(200);
    });

    test('return no interval when multiple actions are found or the duration limit is reached', () => {
        expect(getNextPollingInterval(multipleActions, 0, 0, pollingConfig)).toBeUndefined();
        expect(getNextPollingInterval(singleAction, 2, 100, pollingConfig)).toBeUndefined();
    });
});
