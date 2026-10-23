import type { IGrant } from '@integration-components/types';
import type { CapitalTranslationKey } from '../../shared';

export type GrantStatusVariant = 'Default' | 'Warning' | 'Error' | 'Light';

export type GrantConfig = {
    amount: IGrant['grantAmount'];
    amountLabelKey: CapitalTranslationKey;
    areActionsVisible: boolean;
    areDetailsVisible: boolean;
    areRepaymentDetailsVisible: boolean;
    isAmountColorSecondary: boolean;
    isBackgroundFilled: boolean;
    isGrantIdVisible: boolean;
    isLabelColorSecondary: boolean;
    isPendingAlertVisible: boolean;
    isProgressBarVisible: boolean;
    repaymentPeriodEndDate: Date;
    statusKey?: CapitalTranslationKey;
    statusTagVariant: GrantStatusVariant;
    statusTooltipKey?: CapitalTranslationKey;
};

export type EnhancedGrant = Omit<IGrant, 'maximumRepaymentPeriodDays'> & {
    maximumRepaymentPeriodMonths: number | undefined;
};

const getRepaymentPeriodEndDate = (repaymentPeriodLeft: number) => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + repaymentPeriodLeft);
    return endDate;
};

const getStatusKey = ({ status, missingActions }: IGrant, areActionsLocallyCompleted?: boolean): CapitalTranslationKey | undefined => {
    switch (status) {
        case 'Failed':
            return 'capital.overview.grants.statuses.failed';
        case 'Pending':
            return !areActionsLocallyCompleted && missingActions?.length
                ? 'capital.overview.grants.statuses.actionNeeded'
                : 'capital.overview.grants.statuses.pending';
        case 'Repaid':
            return 'capital.overview.grants.statuses.fullyRepaid';
        case 'Revoked':
            return 'capital.overview.grants.statuses.revoked';
        case 'WrittenOff':
            return 'capital.overview.grants.statuses.writtenOff';
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

const getStatusTooltipKey = ({ status, missingActions }: IGrant, areActionsLocallyCompleted?: boolean): CapitalTranslationKey | undefined => {
    switch (status) {
        case 'Pending':
            return !areActionsLocallyCompleted && missingActions?.length ? undefined : 'capital.overview.grants.statuses.pendingDescription';
        case 'Failed':
            return 'capital.overview.grants.statuses.failedDescription';
        case 'WrittenOff':
            return 'capital.overview.grants.statuses.writtenOffDescription';
        case 'Revoked':
            return 'capital.overview.grants.statuses.revokedDescription';
        default:
            return undefined;
    }
};

export const getGrantConfig = (grant: IGrant, areActionsLocallyCompleted?: boolean): GrantConfig => {
    const isGrantActive = grant.status === 'Active';
    const hasActions = !!grant.missingActions?.length;

    return {
        amount: isGrantActive ? grant.remainingTotalAmount : grant.grantAmount,
        amountLabelKey: isGrantActive ? 'capital.overview.grants.amounts.remaining' : 'capital.overview.grants.amounts.requestedFunds',
        areActionsVisible: hasActions,
        areDetailsVisible: isGrantActive,
        areRepaymentDetailsVisible: isGrantActive && !!grant.unscheduledRepaymentAccounts?.length,
        isAmountColorSecondary: !isGrantActive,
        isBackgroundFilled: grant.status === 'Repaid',
        isGrantIdVisible: !isGrantActive,
        isLabelColorSecondary: isGrantActive,
        isPendingAlertVisible: grant.status === 'Pending' && !hasActions,
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
