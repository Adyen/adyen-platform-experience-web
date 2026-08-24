import type { IGrant } from '@integration-components/types';
import { TranslationKey } from '@integration-components/core';

export type GrantStatusVariant = 'Default' | 'Warning' | 'Error' | 'Light';

export type GrantConfig = {
    amount: IGrant['grantAmount'];
    amountLabelKey: TranslationKey;
    hasAlerts: boolean;
    hasDetails: boolean;
    hasUnscheduledRepaymentDetails: boolean;
    isAmountColorSecondary: boolean;
    isBackgroundFilled: boolean;
    isGrantIdVisible: boolean;
    isLabelColorSecondary: boolean;
    isProgressBarVisible: boolean;
    repaymentPeriodEndDate: Date;
    statusKey?: TranslationKey;
    statusTagVariant: GrantStatusVariant;
    statusTooltipKey?: TranslationKey;
};

export type EnhancedGrant = Omit<IGrant, 'maximumRepaymentPeriodDays'> & {
    maximumRepaymentPeriodMonths: number | undefined;
};

const getRepaymentPeriodEndDate = (repaymentPeriodLeft: number) => {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + repaymentPeriodLeft);
    return endDate;
};

const getStatusKey = ({ status, missingActions }: IGrant, areActionsLocallyCompleted?: boolean): TranslationKey | undefined => {
    switch (status) {
        case 'Failed':
            return 'capital.overview.grants.common.statuses.failed';
        case 'Pending':
            return !areActionsLocallyCompleted && missingActions?.length
                ? 'capital.overview.grants.common.statuses.actionNeeded'
                : 'capital.overview.grants.common.statuses.pending';
        case 'Repaid':
            return 'capital.overview.grants.common.statuses.fullyRepaid';
        case 'Revoked':
            return 'capital.overview.grants.common.statuses.revoked';
        case 'WrittenOff':
            return 'capital.overview.grants.common.statuses.writtenOff';
        default:
            return undefined;
    }
};

const getStatusTagVariant = ({ status, missingActions }: IGrant, areActionsLocallyCompleted?: boolean): GrantStatusVariant => {
    switch (status) {
        case 'Failed':
            return 'Error';
        case 'Pending':
            return !areActionsLocallyCompleted && missingActions?.length ? 'Warning' : 'Default';
        case 'Repaid':
            return 'Light';
        case 'Revoked':
        case 'WrittenOff':
            return 'Warning';
        default:
            return 'Default';
    }
};

const getStatusTooltipKey = ({ status, missingActions }: IGrant, areActionsLocallyCompleted?: boolean): TranslationKey | undefined => {
    switch (status) {
        case 'Pending':
            return !areActionsLocallyCompleted && missingActions?.length
                ? undefined
                : 'capital.overview.grants.common.statuses.pending.description.awaitingFunds';
        case 'Failed':
            return 'capital.overview.grants.common.statuses.failed.description';
        case 'WrittenOff':
            return 'capital.overview.grants.common.statuses.writtenOff.description';
        case 'Revoked':
            return 'capital.overview.grants.common.statuses.revoked.description';
        default:
            return undefined;
    }
};

export const getGrantConfig = (grant: IGrant, areActionsLocallyCompleted?: boolean): GrantConfig => {
    const isGrantActive = grant.status === 'Active';
    const isGrantPending = grant.status === 'Pending';

    return {
        amount: isGrantActive ? grant.remainingTotalAmount : grant.grantAmount,
        amountLabelKey: isGrantActive ? 'capital.overview.grants.item.amounts.remaining' : 'capital.overview.grants.item.amounts.requestedFunds',
        hasAlerts: isGrantPending,
        hasDetails: isGrantActive,
        hasUnscheduledRepaymentDetails: isGrantActive && !!grant.unscheduledRepaymentAccounts?.length,
        isAmountColorSecondary: !isGrantActive,
        isBackgroundFilled: grant.status === 'Repaid',
        isGrantIdVisible: !isGrantActive,
        isLabelColorSecondary: isGrantActive,
        isProgressBarVisible: isGrantActive,
        repaymentPeriodEndDate: getRepaymentPeriodEndDate(grant.repaymentPeriodLeft),
        statusKey: getStatusKey(grant, areActionsLocallyCompleted),
        statusTagVariant: getStatusTagVariant(grant, areActionsLocallyCompleted),
        statusTooltipKey: getStatusTooltipKey(grant, areActionsLocallyCompleted),
    };
};

export const getEnhancedGrant = (grant: IGrant): EnhancedGrant => {
    const { maximumRepaymentPeriodDays, ...rest } = grant;
    return {
        ...rest,
        maximumRepaymentPeriodMonths: grant.maximumRepaymentPeriodDays === undefined ? undefined : Math.ceil(grant.maximumRepaymentPeriodDays / 30),
    };
};
