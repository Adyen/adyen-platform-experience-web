import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
    ACTIVE_GRANT,
    ACTIVE_GRANT_NL,
    DEFAULT_GRANT,
    FAILED_GRANT,
    PENDING_GRANT,
    PENDING_GRANT_WITH_SINGLE_ACTION,
    REPAID_GRANT,
    REVOKED_GRANT,
    WRITTEN_OFF_GRANT,
} from '../../../../mocks/mock-data/capital';
import { getEnhancedGrant, getGrantConfig, GrantConfig } from './grant';

describe('getGrantConfig', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime('2025-01-01T00:00:00');
    });

    test('returns config for pending grant', () => {
        const config = getGrantConfig(PENDING_GRANT);
        expect(config).toEqual<GrantConfig>({
            amount: ACTIVE_GRANT.grantAmount,
            amountLabelKey: 'capital.overview.grants.item.amounts.requestedFunds',
            hasAlerts: true,
            hasDetails: false,
            hasUnscheduledRepaymentDetails: false,
            isAmountColorSecondary: true,
            isBackgroundFilled: false,
            isGrantIdVisible: true,
            isLabelColorSecondary: false,
            isProgressBarVisible: false,
            repaymentPeriodEndDate: new Date('2025-05-16T00:00:00'),
            statusKey: 'capital.overview.grants.common.statuses.pending',
            statusTagVariant: 'Default',
            statusTooltipKey: 'capital.overview.grants.common.statuses.pending.description.awaitingFunds',
        });
    });

    test('returns config for pending grant with actions', () => {
        const config = getGrantConfig(PENDING_GRANT_WITH_SINGLE_ACTION);
        expect(config).toEqual<GrantConfig>({
            amount: ACTIVE_GRANT.grantAmount,
            amountLabelKey: 'capital.overview.grants.item.amounts.requestedFunds',
            hasAlerts: true,
            hasDetails: false,
            hasUnscheduledRepaymentDetails: false,
            isAmountColorSecondary: true,
            isBackgroundFilled: false,
            isGrantIdVisible: true,
            isLabelColorSecondary: false,
            isProgressBarVisible: false,
            repaymentPeriodEndDate: new Date('2025-05-16T00:00:00'),
            statusKey: 'capital.overview.grants.common.statuses.actionNeeded',
            statusTagVariant: 'Warning',
            statusTooltipKey: undefined,
        });
    });

    test('returns config for pending grant with locally completed actions', () => {
        const config = getGrantConfig(PENDING_GRANT_WITH_SINGLE_ACTION, true);
        expect(config).toEqual<GrantConfig>({
            amount: ACTIVE_GRANT.grantAmount,
            amountLabelKey: 'capital.overview.grants.item.amounts.requestedFunds',
            hasAlerts: true,
            hasDetails: false,
            hasUnscheduledRepaymentDetails: false,
            isAmountColorSecondary: true,
            isBackgroundFilled: false,
            isGrantIdVisible: true,
            isLabelColorSecondary: false,
            isProgressBarVisible: false,
            repaymentPeriodEndDate: new Date('2025-05-16T00:00:00'),
            statusKey: 'capital.overview.grants.common.statuses.pending',
            statusTagVariant: 'Default',
            statusTooltipKey: 'capital.overview.grants.common.statuses.pending.description.awaitingFunds',
        });
    });

    test('returns config for active grant', () => {
        const config = getGrantConfig(ACTIVE_GRANT);
        expect(config).toEqual<GrantConfig>({
            amount: ACTIVE_GRANT.remainingTotalAmount,
            amountLabelKey: 'capital.overview.grants.item.amounts.remaining',
            hasAlerts: false,
            hasDetails: true,
            hasUnscheduledRepaymentDetails: false,
            isAmountColorSecondary: false,
            isBackgroundFilled: false,
            isGrantIdVisible: false,
            isLabelColorSecondary: true,
            isProgressBarVisible: true,
            repaymentPeriodEndDate: new Date('2025-05-16T00:00:00'),
            statusKey: undefined,
            statusTagVariant: 'Default',
            statusTooltipKey: undefined,
        });
    });

    test('enables unscheduled repayment details for active grants with a repayment account', () => {
        expect(getGrantConfig(ACTIVE_GRANT_NL).hasUnscheduledRepaymentDetails).toBe(true);
    });

    test('returns config for failed grant', () => {
        const config = getGrantConfig(FAILED_GRANT);
        expect(config).toEqual<GrantConfig>({
            amount: ACTIVE_GRANT.grantAmount,
            amountLabelKey: 'capital.overview.grants.item.amounts.requestedFunds',
            hasAlerts: false,
            hasDetails: false,
            hasUnscheduledRepaymentDetails: false,
            isAmountColorSecondary: true,
            isBackgroundFilled: false,
            isGrantIdVisible: true,
            isLabelColorSecondary: false,
            isProgressBarVisible: false,
            repaymentPeriodEndDate: new Date('2025-05-16T00:00:00'),
            statusKey: 'capital.overview.grants.common.statuses.failed',
            statusTagVariant: 'Error',
            statusTooltipKey: 'capital.overview.grants.common.statuses.failed.description',
        });
    });

    test('returns config for repaid grant', () => {
        const config = getGrantConfig(REPAID_GRANT);
        expect(config).toEqual<GrantConfig>({
            amount: ACTIVE_GRANT.grantAmount,
            amountLabelKey: 'capital.overview.grants.item.amounts.requestedFunds',
            hasAlerts: false,
            hasDetails: false,
            hasUnscheduledRepaymentDetails: false,
            isAmountColorSecondary: true,
            isBackgroundFilled: true,
            isGrantIdVisible: true,
            isLabelColorSecondary: false,
            isProgressBarVisible: false,
            repaymentPeriodEndDate: new Date('2025-05-16T00:00:00'),
            statusKey: 'capital.overview.grants.common.statuses.fullyRepaid',
            statusTagVariant: 'Light',
            statusTooltipKey: undefined,
        });
    });

    test('returns config for revoked grant', () => {
        const config = getGrantConfig(REVOKED_GRANT);
        expect(config).toEqual<GrantConfig>({
            amount: ACTIVE_GRANT.grantAmount,
            amountLabelKey: 'capital.overview.grants.item.amounts.requestedFunds',
            hasAlerts: false,
            hasDetails: false,
            hasUnscheduledRepaymentDetails: false,
            isAmountColorSecondary: true,
            isBackgroundFilled: false,
            isGrantIdVisible: true,
            isLabelColorSecondary: false,
            isProgressBarVisible: false,
            repaymentPeriodEndDate: new Date('2025-05-16T00:00:00'),
            statusKey: 'capital.overview.grants.common.statuses.revoked',
            statusTagVariant: 'Warning',
            statusTooltipKey: 'capital.overview.grants.common.statuses.revoked.description',
        });
    });

    test('returns config for written off grant', () => {
        const config = getGrantConfig(WRITTEN_OFF_GRANT);
        expect(config).toEqual<GrantConfig>({
            amount: ACTIVE_GRANT.grantAmount,
            amountLabelKey: 'capital.overview.grants.item.amounts.requestedFunds',
            hasAlerts: false,
            hasDetails: false,
            hasUnscheduledRepaymentDetails: false,
            isAmountColorSecondary: true,
            isBackgroundFilled: false,
            isGrantIdVisible: true,
            isLabelColorSecondary: false,
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
