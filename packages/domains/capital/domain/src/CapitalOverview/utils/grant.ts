import type { IGrant } from '@integration-components/types';
import type { CapitalTranslationKey, ContractTypeKeyMap } from '../../shared';

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

const CONTRACT_KEYS = {
    amount: {
        CashAdvance: 'capital.overview.grantItem.cashAdvance.grantAmount',
        Loan: 'capital.overview.grantItem.loan.grantAmount',
    },
    pendingTooltip: {
        CashAdvance: 'capital.overview.grantStatuses.cashAdvance.pending.description',
        Loan: 'capital.overview.grantStatuses.loan.pending.description',
    },
    repaidStatus: {
        CashAdvance: 'capital.overview.grantStatuses.cashAdvance.repaid.label',
        Loan: 'capital.overview.grantStatuses.loan.repaid.label',
    },
    repaidTooltip: {
        CashAdvance: 'capital.overview.grantStatuses.cashAdvance.repaid.description',
        Loan: undefined,
    },
    revokedTooltip: {
        CashAdvance: 'capital.overview.grantStatuses.cashAdvance.revoked.description',
        Loan: 'capital.overview.grantStatuses.loan.revoked.description',
    },
    writtenOffStatus: {
        CashAdvance: 'capital.overview.grantStatuses.cashAdvance.writtenOff.label',
        Loan: 'capital.overview.grantStatuses.loan.writtenOff.label',
    },
    writtenOffTooltip: {
        CashAdvance: 'capital.overview.grantStatuses.cashAdvance.writtenOff.description',
        Loan: 'capital.overview.grantStatuses.loan.writtenOff.description',
    },
} satisfies ContractTypeKeyMap;

const getRepaymentPeriodEndDate = (repaymentPeriodLeft: number) => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + repaymentPeriodLeft);
    return endDate;
};

const getStatusKey = ({ contractType, status, missingActions }: IGrant, areActionsLocallyCompleted?: boolean): CapitalTranslationKey | undefined => {
    switch (status) {
        case 'Failed':
            return 'capital.overview.grantStatuses.failed.label';
        case 'Pending':
            return !areActionsLocallyCompleted && missingActions?.length
                ? 'capital.overview.grantStatuses.actionNeeded.label'
                : 'capital.overview.grantStatuses.pending.label';
        case 'Repaid':
            return CONTRACT_KEYS.repaidStatus[contractType];
        case 'Revoked':
            return 'capital.overview.grantStatuses.revoked.label';
        case 'WrittenOff':
            return CONTRACT_KEYS.writtenOffStatus[contractType];
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

const getStatusTooltipKey = (
    { contractType, status, missingActions }: IGrant,
    areActionsLocallyCompleted?: boolean
): CapitalTranslationKey | undefined => {
    switch (status) {
        case 'Pending':
            return !areActionsLocallyCompleted && missingActions?.length ? undefined : CONTRACT_KEYS.pendingTooltip[contractType];
        case 'Failed':
            return 'capital.overview.grantStatuses.failed.description';
        case 'Repaid':
            return CONTRACT_KEYS.repaidTooltip[contractType];
        case 'WrittenOff':
            return CONTRACT_KEYS.writtenOffTooltip[contractType];
        case 'Revoked':
            return CONTRACT_KEYS.revokedTooltip[contractType];
        default:
            return undefined;
    }
};

export const getGrantConfig = (grant: IGrant, areActionsLocallyCompleted?: boolean): GrantConfig => {
    const isGrantActive = grant.status === 'Active';
    const hasActions = !!grant.missingActions?.length;

    return {
        amount: isGrantActive ? grant.remainingTotalAmount : grant.grantAmount,
        amountLabelKey: isGrantActive ? 'capital.overview.grantItem.remainingGrantAmount' : CONTRACT_KEYS.amount[grant.contractType],
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
