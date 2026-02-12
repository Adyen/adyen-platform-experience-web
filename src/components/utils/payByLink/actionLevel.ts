import { parseDate } from '../../../utils';

export const ACTION_NEEDED_URGENTLY_THRESHOLD_DAYS = 10;

export const enum ActionNeededLevel {
    NEVER = 0, // 3-bits (0 0 0)
    SOON = 1, // 3-bits (0 0 1)
    URGENTLY = 3, // 3-bits (0 1 1)
    NOW = 7, // 3-bits (1 1 1)
}

export const getActionNeededLevel = (date: string): ActionNeededLevel => {
    const deadlineTimestamp = parseDate(date);

    if (deadlineTimestamp != undefined) {
        const now = Date.now();
        const deadline = new Date(deadlineTimestamp);
        const actionNeededNowThresholdTimestamp = new Date(deadline).setHours(deadline.getHours() - 24);

        if (actionNeededNowThresholdTimestamp <= now) {
            return ActionNeededLevel.NOW;
        }

        const actionNeededUrgentlyThresholdTimestamp = new Date(deadline).setDate(deadline.getDate() - ACTION_NEEDED_URGENTLY_THRESHOLD_DAYS);

        if (actionNeededUrgentlyThresholdTimestamp <= now) {
            return ActionNeededLevel.URGENTLY;
        }
    }

    return ActionNeededLevel.SOON;
};

export const isDisputeActionNeeded = (date: string): boolean => {
    return getActionNeededLevel(date) > ActionNeededLevel.NEVER;
};

export const isActionNeededUrgently = (date: string): boolean => {
    return getActionNeededLevel(date) > ActionNeededLevel.SOON;
};

export const isDisputeActionNeededNow = (date: string): boolean => {
    return getActionNeededLevel(date) === ActionNeededLevel.NOW;
};
