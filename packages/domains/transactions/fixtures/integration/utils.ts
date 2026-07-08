import type { Page } from '@playwright/test';
import { expectAnalyticsEvents } from '@integration-components/testing/playwright/utils';
import { expect, type PageAnalyticsEvent } from '@integration-components/testing/fixtures/eventDispatcher/events';
import {
    sharedTransactionsInsightsAnalyticsEventProperties,
    sharedTransactionsListAnalyticsEventProperties,
} from '../constants/TransactionsOverview';

export const goToView = async (page: Page, analyticsEvents: PageAnalyticsEvent[], name: 'Transactions' | 'Insights') => {
    await page.getByRole('radio', { name, exact: true }).click();
    await expect(page.getByRole('radio', { name, exact: true, checked: true })).toBeVisible();

    await expectAnalyticsEvents(analyticsEvents, [
        ['Duration', name === 'Insights' ? sharedTransactionsListAnalyticsEventProperties : sharedTransactionsInsightsAnalyticsEventProperties],
        ['Landed on page', name === 'Insights' ? sharedTransactionsInsightsAnalyticsEventProperties : sharedTransactionsListAnalyticsEventProperties],
    ]);
};
