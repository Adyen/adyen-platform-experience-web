import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';
import { CUSTOM_URL_EXAMPLE } from '@integration-components/testing/storybook-helpers';
import { expectCustomDisputeDetails } from '../shared/customDataAssertions';

const STORY_ID = 'mocked-disputes-dispute-management--data-customization';

test.describe('Data Customization', () => {
    test('should render dispute details with custom data fields and action buttons', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        const { actionButton, summaryLink } = await expectCustomDisputeDetails({
            root: page,
            summaryLinkName: 'Go to Summary',
            hiddenLabels: ['Dispute reference', 'Opened on', 'Respond by', 'Account'],
        });

        const [newPage] = await Promise.all([page.context().waitForEvent('page'), summaryLink.click()]);

        await newPage.waitForLoadState();
        expect(newPage.url()).toContain(CUSTOM_URL_EXAMPLE);

        const messages: string[] = [];
        page.once('console', message => messages.push(message.text()));

        await actionButton.click();
        expect(messages).toContain('Action');
    });
});
