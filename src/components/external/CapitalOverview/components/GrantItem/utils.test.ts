import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
    ACTIVE_GRANT,
    FAILED_GRANT,
    PENDING_GRANT,
    PENDING_GRANT_WITH_ACTIONS,
    REPAID_GRANT,
    REVOKED_GRANT,
    WRITTEN_OFF_GRANT,
} from '../../../../../../mocks/mock-data';
import { getGrantConfig } from './utils';
import { TagVariant } from '../../../../internal/Tag/types';
import { GrantConfig } from './types';

describe('getGrantConfig', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime('2025-01-01T00:00:00');
    });

    test('returns config for pending grant', () => {
        const config = getGrantConfig(PENDING_GRANT);
        expect(config).toEqual<GrantConfig>({
            amount: ACTIVE_GRANT.grantAmount,
            amountLabelKey: 'capital.requestedFunds',
            hasAlerts: true,
            hasDetails: false,
            hasUnscheduledRepaymentDetails: false,
            isAmountColorSecondary: true,
            isBackgroundFilled: false,
            isGrantIdVisible: true,
            isLabelColorSecondary: false,
            isProgressBarVisible: false,
            repaymentPeriodEndDate: new Date('2025-05-16T00:00:00'),
            statusKey: 'capital.pending',
            statusTagVariant: TagVariant.DEFAULT,
            statusTooltipKey: 'capital.youShouldGetTheFundsWithinOneBusinessDay',
        });
    });

    test('returns config for pending grant with actions', () => {
        const config = getGrantConfig(PENDING_GRANT_WITH_ACTIONS);
        expect(config).toEqual<GrantConfig>({
            amount: ACTIVE_GRANT.grantAmount,
            amountLabelKey: 'capital.requestedFunds',
            hasAlerts: true,
            hasDetails: false,
            hasUnscheduledRepaymentDetails: false,
            isAmountColorSecondary: true,
            isBackgroundFilled: false,
            isGrantIdVisible: true,
            isLabelColorSecondary: false,
            isProgressBarVisible: false,
            repaymentPeriodEndDate: new Date('2025-05-16T00:00:00'),
            statusKey: 'capital.actionNeeded',
            statusTagVariant: TagVariant.WARNING,
            statusTooltipKey: 'capital.signTheTermsToReceiveYourFunds',
        });
    });

    test('returns config for active grant', () => {
        const config = getGrantConfig(ACTIVE_GRANT);
        expect(config).toEqual<GrantConfig>({
            amount: ACTIVE_GRANT.remainingTotalAmount,
            amountLabelKey: 'capital.remaining',
            hasAlerts: false,
            hasDetails: true,
            hasUnscheduledRepaymentDetails: true,
            isAmountColorSecondary: false,
            isBackgroundFilled: false,
            isGrantIdVisible: false,
            isLabelColorSecondary: true,
            isProgressBarVisible: true,
            repaymentPeriodEndDate: new Date('2025-05-16T00:00:00'),
            statusKey: undefined,
            statusTagVariant: TagVariant.DEFAULT,
            statusTooltipKey: undefined,
        });
    });

    test('returns config for failed grant', () => {
        const config = getGrantConfig(FAILED_GRANT);
        expect(config).toEqual<GrantConfig>({
            amount: ACTIVE_GRANT.grantAmount,
            amountLabelKey: 'capital.requestedFunds',
            hasAlerts: false,
            hasDetails: false,
            hasUnscheduledRepaymentDetails: false,
            isAmountColorSecondary: true,
            isBackgroundFilled: false,
            isGrantIdVisible: true,
            isLabelColorSecondary: false,
            isProgressBarVisible: false,
            repaymentPeriodEndDate: new Date('2025-05-16T00:00:00'),
            statusKey: 'capital.failed',
            statusTagVariant: TagVariant.ERROR,
            statusTooltipKey: 'capital.weCouldNotProcessThisRequestTryAgain',
        });
    });

    test('returns config for repaid grant', () => {
        const config = getGrantConfig(REPAID_GRANT);
        expect(config).toEqual<GrantConfig>({
            amount: ACTIVE_GRANT.grantAmount,
            amountLabelKey: 'capital.requestedFunds',
            hasAlerts: false,
            hasDetails: false,
            hasUnscheduledRepaymentDetails: false,
            isAmountColorSecondary: true,
            isBackgroundFilled: true,
            isGrantIdVisible: true,
            isLabelColorSecondary: false,
            isProgressBarVisible: false,
            repaymentPeriodEndDate: new Date('2025-05-16T00:00:00'),
            statusKey: 'capital.fullyRepaid',
            statusTagVariant: TagVariant.LIGHT,
            statusTooltipKey: undefined,
        });
    });

    test('returns config for revoked grant', () => {
        const config = getGrantConfig(REVOKED_GRANT);
        expect(config).toEqual<GrantConfig>({
            amount: ACTIVE_GRANT.grantAmount,
            amountLabelKey: 'capital.requestedFunds',
            hasAlerts: false,
            hasDetails: false,
            hasUnscheduledRepaymentDetails: false,
            isAmountColorSecondary: true,
            isBackgroundFilled: false,
            isGrantIdVisible: true,
            isLabelColorSecondary: false,
            isProgressBarVisible: false,
            repaymentPeriodEndDate: new Date('2025-05-16T00:00:00'),
            statusKey: 'capital.revoked',
            statusTagVariant: TagVariant.WARNING,
            statusTooltipKey: 'capital.youAcceptedButThenReturnedTheseFunds',
        });
    });

    test('returns config for written off grant', () => {
        const config = getGrantConfig(WRITTEN_OFF_GRANT);
        expect(config).toEqual<GrantConfig>({
            amount: ACTIVE_GRANT.grantAmount,
            amountLabelKey: 'capital.requestedFunds',
            hasAlerts: false,
            hasDetails: false,
            hasUnscheduledRepaymentDetails: false,
            isAmountColorSecondary: true,
            isBackgroundFilled: false,
            isGrantIdVisible: true,
            isLabelColorSecondary: false,
            isProgressBarVisible: false,
            repaymentPeriodEndDate: new Date('2025-05-16T00:00:00'),
            statusKey: 'capital.writtenOff',
            statusTagVariant: TagVariant.WARNING,
            statusTooltipKey: 'capital.youAcceptedTheseFundsButDidNotRepayThem',
        });
    });
});
