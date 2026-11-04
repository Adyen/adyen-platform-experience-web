import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
    ACTIVE_LOAN,
    DEFAULT_GRANT,
    SINGLE_ACTION_LOAN,
    PENDING_LOAN,
    REVOKED_LOAN,
    WRITTEN_OFF_LOAN,
    FAILED_LOAN,
    REPAID_LOAN,
    ACTIVE_WITHOUT_REPAYMENT_ACCOUNT,
} from '../../../../mocks/mock-data';
import { getEnhancedGrant, getGrantConfig, GrantConfig } from './grant';

describe('getGrantConfig', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime('2025-01-01T00:00:00');
    });

    test('returns config for pending grant', () => {
        const config = getGrantConfig(PENDING_LOAN);
        expect(config).toEqual<GrantConfig>({
            amount: ACTIVE_LOAN.grantAmount,
            amountLabelKey: 'capital.overview.grants.item.amounts.requestedFunds',
            areActionsVisible: false,
            areDetailsVisible: false,
            areRepaymentDetailsVisible: false,
            isAmountColorSecondary: true,
            isBackgroundFilled: false,
            isGrantIdVisible: true,
            isLabelColorSecondary: false,
            isPendingAlertVisible: true,
            isProgressBarVisible: false,
            repaymentPeriodEndDate: new Date('2025-05-16T00:00:00'),
            statusKey: 'capital.overview.grants.common.statuses.pending',
            statusTagVariant: 'Default',
            statusTooltipKey: 'capital.overview.grants.common.statuses.pending.description.awaitingFunds',
        });
    });

    test('returns config for pending grant with actions', () => {
        const config = getGrantConfig(SINGLE_ACTION_LOAN);
        expect(config).toEqual<GrantConfig>({
            amount: ACTIVE_LOAN.grantAmount,
            amountLabelKey: 'capital.overview.grants.item.amounts.requestedFunds',
            areActionsVisible: true,
            areDetailsVisible: false,
            areRepaymentDetailsVisible: false,
            isAmountColorSecondary: true,
            isBackgroundFilled: false,
            isGrantIdVisible: true,
            isLabelColorSecondary: false,
            isPendingAlertVisible: false,
            isProgressBarVisible: false,
            repaymentPeriodEndDate: new Date('2025-05-16T00:00:00'),
            statusKey: 'capital.overview.grants.common.statuses.actionNeeded',
            statusTagVariant: 'Warning',
            statusTooltipKey: undefined,
        });
    });

    test('returns config for pending grant with locally completed actions', () => {
        const config = getGrantConfig(SINGLE_ACTION_LOAN, true);
        expect(config).toEqual<GrantConfig>({
            amount: ACTIVE_LOAN.grantAmount,
            amountLabelKey: 'capital.overview.grants.item.amounts.requestedFunds',
            areActionsVisible: true,
            areDetailsVisible: false,
            areRepaymentDetailsVisible: false,
            isAmountColorSecondary: true,
            isBackgroundFilled: false,
            isGrantIdVisible: true,
            isLabelColorSecondary: false,
            isPendingAlertVisible: false,
            isProgressBarVisible: false,
            repaymentPeriodEndDate: new Date('2025-05-16T00:00:00'),
            statusKey: 'capital.overview.grants.common.statuses.pending',
            statusTagVariant: 'Default',
            statusTooltipKey: 'capital.overview.grants.common.statuses.pending.description.awaitingFunds',
        });
    });

    test('returns config for active grant', () => {
        const config = getGrantConfig(ACTIVE_LOAN);
        expect(config).toEqual<GrantConfig>({
            amount: ACTIVE_LOAN.remainingTotalAmount,
            amountLabelKey: 'capital.overview.grants.item.amounts.remaining',
            areActionsVisible: false,
            areDetailsVisible: true,
            areRepaymentDetailsVisible: true,
            isAmountColorSecondary: false,
            isBackgroundFilled: false,
            isGrantIdVisible: false,
            isLabelColorSecondary: true,
            isPendingAlertVisible: false,
            isProgressBarVisible: true,
            repaymentPeriodEndDate: new Date('2025-05-16T00:00:00'),
            statusKey: undefined,
            statusTagVariant: 'Default',
            statusTooltipKey: undefined,
        });
    });

    test('enables unscheduled repayment details for active grants with a repayment account', () => {
        expect(getGrantConfig(ACTIVE_WITHOUT_REPAYMENT_ACCOUNT).areRepaymentDetailsVisible).toBe(false);
    });

    test('returns config for failed grant', () => {
        const config = getGrantConfig(FAILED_LOAN);
        expect(config).toEqual<GrantConfig>({
            amount: ACTIVE_LOAN.grantAmount,
            amountLabelKey: 'capital.overview.grants.item.amounts.requestedFunds',
            areActionsVisible: false,
            areDetailsVisible: false,
            areRepaymentDetailsVisible: false,
            isAmountColorSecondary: true,
            isBackgroundFilled: false,
            isGrantIdVisible: true,
            isLabelColorSecondary: false,
            isPendingAlertVisible: false,
            isProgressBarVisible: false,
            repaymentPeriodEndDate: new Date('2025-05-16T00:00:00'),
            statusKey: 'capital.overview.grants.common.statuses.failed',
            statusTagVariant: 'Error',
            statusTooltipKey: 'capital.overview.grants.common.statuses.failed.description',
        });
    });

    test('returns config for repaid grant', () => {
        const config = getGrantConfig(REPAID_LOAN);
        expect(config).toEqual<GrantConfig>({
            amount: ACTIVE_LOAN.grantAmount,
            amountLabelKey: 'capital.overview.grants.item.amounts.requestedFunds',
            areActionsVisible: false,
            areDetailsVisible: false,
            areRepaymentDetailsVisible: false,
            isAmountColorSecondary: true,
            isBackgroundFilled: true,
            isGrantIdVisible: true,
            isLabelColorSecondary: false,
            isPendingAlertVisible: false,
            isProgressBarVisible: false,
            repaymentPeriodEndDate: new Date('2025-05-16T00:00:00'),
            statusKey: 'capital.overview.grants.common.statuses.fullyRepaid',
            statusTagVariant: 'Light',
            statusTooltipKey: undefined,
        });
    });

    test('returns config for revoked grant', () => {
        const config = getGrantConfig(REVOKED_LOAN);
        expect(config).toEqual<GrantConfig>({
            amount: ACTIVE_LOAN.grantAmount,
            amountLabelKey: 'capital.overview.grants.item.amounts.requestedFunds',
            areActionsVisible: false,
            areDetailsVisible: false,
            areRepaymentDetailsVisible: false,
            isAmountColorSecondary: true,
            isBackgroundFilled: false,
            isGrantIdVisible: true,
            isLabelColorSecondary: false,
            isPendingAlertVisible: false,
            isProgressBarVisible: false,
            repaymentPeriodEndDate: new Date('2025-05-16T00:00:00'),
            statusKey: 'capital.overview.grants.common.statuses.revoked',
            statusTagVariant: 'Warning',
            statusTooltipKey: 'capital.overview.grants.common.statuses.revoked.description',
        });
    });

    test('returns config for written off grant', () => {
        const config = getGrantConfig(WRITTEN_OFF_LOAN);
        expect(config).toEqual<GrantConfig>({
            amount: ACTIVE_LOAN.grantAmount,
            amountLabelKey: 'capital.overview.grants.item.amounts.requestedFunds',
            areActionsVisible: false,
            areDetailsVisible: false,
            areRepaymentDetailsVisible: false,
            isAmountColorSecondary: true,
            isBackgroundFilled: false,
            isGrantIdVisible: true,
            isLabelColorSecondary: false,
            isPendingAlertVisible: false,
            isProgressBarVisible: false,
            repaymentPeriodEndDate: new Date('2025-05-16T00:00:00'),
            statusKey: 'capital.overview.grants.common.statuses.writtenOff',
            statusTagVariant: 'Warning',
            statusTooltipKey: 'capital.overview.grants.common.statuses.writtenOff.description',
        });
    });
});

describe('getEnhancedGrant', () => {
    test('replaces maximum repayment period days with months', () => {
        expect(getEnhancedGrant({ ...DEFAULT_GRANT, maximumRepaymentPeriodDays: 0 })).toMatchObject({ maximumRepaymentPeriodMonths: 0 });
        expect(getEnhancedGrant(DEFAULT_GRANT)).toMatchObject({ maximumRepaymentPeriodMonths: 9 });
    });

    test('makes maximum repayment period months undefined when period days are undefined', () => {
        expect(getEnhancedGrant({ ...DEFAULT_GRANT, maximumRepaymentPeriodDays: undefined }).maximumRepaymentPeriodMonths).toBeUndefined();
    });
});
