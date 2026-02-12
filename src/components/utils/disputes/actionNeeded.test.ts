import { describe, expect, test } from 'vitest';
import { DISPUTE_ACTION_NEEDED_URGENTLY_THRESHOLD_DAYS } from './constants';
import {
    DisputeActionNeededLevel,
    getDisputeActionNeededLevel,
    isDisputeActionNeeded,
    isDisputeActionNeededNow,
    isDisputeActionNeededUrgently,
    WithDisputeStatus,
} from './actionNeeded';

const ACTIONABLE_DISPUTE_STATUSES = ['UNDEFENDED', 'UNRESPONDED'] as const;
const NON_ACTIONABLE_DISPUTE_STATUSES = ['ACCEPTED', 'EXPIRED', 'LOST', 'PENDING', 'RESPONDED', 'WON'] as const;
const DEFAULT_DISPUTE_DATA: WithDisputeStatus = { status: 'PENDING' };

const hoursFromNow = (hours = 0) => {
    const now = new Date();
    now.setHours(now.getHours() + hours);
    return now.toISOString();
};

const daysFromNow = (days = 0) => hoursFromNow(days * 24);

describe('getDisputeActionNeededLevel', () => {
    test('should return correct action needed level based on dispute status', () => {
        const disputeData = { ...DEFAULT_DISPUTE_DATA };

        NON_ACTIONABLE_DISPUTE_STATUSES.forEach(status => {
            disputeData.status = status;
            expect(getDisputeActionNeededLevel(disputeData)).toBe(DisputeActionNeededLevel.NEVER);
        });

        ACTIONABLE_DISPUTE_STATUSES.forEach(status => {
            disputeData.status = status;
            expect(getDisputeActionNeededLevel(disputeData)).toBe(DisputeActionNeededLevel.SOON);
        });
    });

    test('should return correct action needed level for dispute with deadline too far in the future', () => {
        const disputeData = {
            ...DEFAULT_DISPUTE_DATA,
            dueDate: daysFromNow(DISPUTE_ACTION_NEEDED_URGENTLY_THRESHOLD_DAYS + 5),
        };

        ACTIONABLE_DISPUTE_STATUSES.forEach(status => {
            disputeData.status = status;
            expect(getDisputeActionNeededLevel(disputeData)).toBe(DisputeActionNeededLevel.SOON);
        });
    });

    test('should return correct action needed level for dispute with deadline too near in the future', () => {
        const disputeData = {
            ...DEFAULT_DISPUTE_DATA,
            dueDate: daysFromNow(DISPUTE_ACTION_NEEDED_URGENTLY_THRESHOLD_DAYS - 5),
        };

        ACTIONABLE_DISPUTE_STATUSES.forEach(status => {
            disputeData.status = status;
            expect(getDisputeActionNeededLevel(disputeData)).toBe(DisputeActionNeededLevel.URGENTLY);
        });
    });

    test('should return correct action needed level for dispute with deadline exceeding 24 hours', () => {
        const disputeData = { ...DEFAULT_DISPUTE_DATA, dueDate: hoursFromNow(25) };

        ACTIONABLE_DISPUTE_STATUSES.forEach(status => {
            disputeData.status = status;
            expect(getDisputeActionNeededLevel(disputeData)).toBe(DisputeActionNeededLevel.URGENTLY);
        });
    });

    test('should return correct action needed level for dispute with deadline within 24 hours', () => {
        const disputeData = { ...DEFAULT_DISPUTE_DATA, dueDate: hoursFromNow(20) };

        ACTIONABLE_DISPUTE_STATUSES.forEach(status => {
            disputeData.status = status;
            expect(getDisputeActionNeededLevel(disputeData)).toBe(DisputeActionNeededLevel.NOW);
        });
    });
});

describe('isDisputeActionNeeded', () => {
    test('should return false for non-actionable dispute status', () => {
        const disputeData = { ...DEFAULT_DISPUTE_DATA };

        NON_ACTIONABLE_DISPUTE_STATUSES.forEach(status => {
            disputeData.status = status;
            expect(isDisputeActionNeeded(disputeData)).toBe(false);
        });
    });

    test('should return true for actionable dispute status', () => {
        const disputeData = { ...DEFAULT_DISPUTE_DATA };

        ACTIONABLE_DISPUTE_STATUSES.forEach(status => {
            disputeData.status = status;
            expect(isDisputeActionNeeded(disputeData)).toBe(true);
        });
    });
});

describe('isDisputeActionNeededUrgently', () => {
    test('should return false for non-actionable dispute status', () => {
        const disputeData = { ...DEFAULT_DISPUTE_DATA };

        NON_ACTIONABLE_DISPUTE_STATUSES.forEach(status => {
            disputeData.status = status;
            expect(isDisputeActionNeededUrgently(disputeData)).toBe(false);
        });
    });

    test('should return false for actionable dispute status without clear deadline', () => {
        const disputeData = { ...DEFAULT_DISPUTE_DATA };

        ACTIONABLE_DISPUTE_STATUSES.forEach(status => {
            disputeData.status = status;
            expect(isDisputeActionNeededUrgently(disputeData)).toBe(false);
        });
    });

    test('should return false for actionable dispute status with deadline too far in the future', () => {
        const disputeData = { ...DEFAULT_DISPUTE_DATA };

        [1, 10, 25].forEach(daysAfterThreshold => {
            disputeData.dueDate = daysFromNow(DISPUTE_ACTION_NEEDED_URGENTLY_THRESHOLD_DAYS + daysAfterThreshold);

            ACTIONABLE_DISPUTE_STATUSES.forEach(status => {
                disputeData.status = status;
                expect(isDisputeActionNeededUrgently(disputeData)).toBe(false);
            });
        });
    });

    test('should return true for actionable dispute status with deadline too near in the future', () => {
        const disputeData = { ...DEFAULT_DISPUTE_DATA };

        [0, 5, 10].forEach(daysBeforeThreshold => {
            disputeData.dueDate = daysFromNow(DISPUTE_ACTION_NEEDED_URGENTLY_THRESHOLD_DAYS - daysBeforeThreshold);

            ACTIONABLE_DISPUTE_STATUSES.forEach(status => {
                disputeData.status = status;
                expect(isDisputeActionNeededUrgently(disputeData)).toBe(true);
            });
        });
    });
});

describe('isDisputeActionNeededNow', () => {
    test('should return false for non-actionable dispute status', () => {
        const disputeData = { ...DEFAULT_DISPUTE_DATA };

        NON_ACTIONABLE_DISPUTE_STATUSES.forEach(status => {
            disputeData.status = status;
            expect(isDisputeActionNeededNow(disputeData)).toBe(false);
        });
    });

    test('should return false for actionable dispute status without clear deadline', () => {
        const disputeData = { ...DEFAULT_DISPUTE_DATA };

        ACTIONABLE_DISPUTE_STATUSES.forEach(status => {
            disputeData.status = status;
            expect(isDisputeActionNeededNow(disputeData)).toBe(false);
        });
    });

    test('should return false for actionable dispute status with deadline not within 24 hours', () => {
        const disputeData = { ...DEFAULT_DISPUTE_DATA };

        [25, 30, 60].forEach(hoursAfterNow => {
            disputeData.dueDate = hoursFromNow(hoursAfterNow);

            ACTIONABLE_DISPUTE_STATUSES.forEach(status => {
                disputeData.status = status;
                expect(isDisputeActionNeededNow(disputeData)).toBe(false);
            });
        });
    });

    test('should return true for actionable dispute status with deadline within 24 hours', () => {
        const disputeData = { ...DEFAULT_DISPUTE_DATA };

        [0, 1, 5, 10, 20, 24].forEach(hoursAfterNow => {
            disputeData.dueDate = hoursFromNow(hoursAfterNow);

            ACTIONABLE_DISPUTE_STATUSES.forEach(status => {
                disputeData.status = status;
                expect(isDisputeActionNeededNow(disputeData)).toBe(true);
            });
        });
    });
});
