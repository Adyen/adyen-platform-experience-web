import { DISPUTE_ACTION_NEEDED_URGENTLY_THRESHOLD_DAYS } from './constants';
import { IDisputeDefensibility, IDisputeStatus } from '../../../types/api/models/disputes';
import { parseDate } from '../../../utils';

export interface WithDisputeStatus {
    dueDate?: string;
    status: IDisputeStatus;
    defensibility?: IDisputeDefensibility;
}

export const enum DisputeActionNeededLevel {
    NEVER = 0, // 3-bits (0 0 0)
    SOON = 1, // 3-bits (0 0 1)
    URGENTLY = 3, // 3-bits (0 1 1)
    NOW = 7, // 3-bits (1 1 1)
}

export const getDisputeActionNeededLevel = <T extends WithDisputeStatus>(disputeData: T): DisputeActionNeededLevel => {
    switch (disputeData.status) {
        case 'UNDEFENDED':
        case 'UNRESPONDED': {
            if (disputeData.defensibility === 'NOT_ACTIONABLE') return DisputeActionNeededLevel.NEVER;

            const deadlineTimestamp = parseDate(disputeData.dueDate);

            if (deadlineTimestamp != undefined) {
                const now = Date.now();
                const deadline = new Date(deadlineTimestamp);
                const actionNeededNowThresholdTimestamp = new Date(deadline).setHours(deadline.getHours() - 24);

                if (actionNeededNowThresholdTimestamp <= now) {
                    return DisputeActionNeededLevel.NOW;
                }

                const actionNeededUrgentlyThresholdTimestamp = new Date(deadline).setDate(
                    deadline.getDate() - DISPUTE_ACTION_NEEDED_URGENTLY_THRESHOLD_DAYS
                );

                if (actionNeededUrgentlyThresholdTimestamp <= now) {
                    return DisputeActionNeededLevel.URGENTLY;
                }
            }

            return DisputeActionNeededLevel.SOON;
        }
    }

    return DisputeActionNeededLevel.NEVER;
};

export const isDisputeActionNeeded = <T extends WithDisputeStatus>(disputeData: T): boolean => {
    return getDisputeActionNeededLevel(disputeData) > DisputeActionNeededLevel.NEVER;
};

export const isDisputeActionNeededUrgently = <T extends WithDisputeStatus>(disputeData: T): boolean => {
    return getDisputeActionNeededLevel(disputeData) > DisputeActionNeededLevel.SOON;
};

export const isDisputeActionNeededNow = <T extends WithDisputeStatus>(disputeData: T): boolean => {
    return getDisputeActionNeededLevel(disputeData) === DisputeActionNeededLevel.NOW;
};
