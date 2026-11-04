import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import { disputesOverviewAnalyticsEventProperties, disputeDetailsAnalyticsEventProperties } from '../../../../fixtures/constants/analytics';

const STORY_ID = 'mocked-disputes-disputes-overview--default';

test.describe('Disputes Overview - Row click', () => {
    test('should open the dispute management modal when a row is clicked', async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });

        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', disputesOverviewAnalyticsEventProperties]]);

        await expect(page.getByText('No chargebacks found')).toBeHidden();

        const grid = page.getByRole('grid');
        await grid.getByRole('rowgroup').nth(1).getByRole('row').first().click();

        const disputeManagementModal = page.getByRole('dialog', { name: 'Dispute management', exact: true });

        await expect(disputeManagementModal).toBeVisible();
        await expect(disputeManagementModal.getByText('Dispute management', { exact: true })).toHaveCount(0);

        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', disputeDetailsAnalyticsEventProperties]]);
    });
});
