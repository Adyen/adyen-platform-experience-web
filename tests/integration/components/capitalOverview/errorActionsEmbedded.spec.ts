import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedGrantsOverviewAnalyticsEventProperties } from './constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--error-actions-embedded';

test.describe('Error - Actions Embedded', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedGrantsOverviewAnalyticsEventProperties]]);
    });

    test('should render pending grant with actions', async ({ page }) => {
        const informationSubmitButton = page.getByRole('button', { name: 'Submit information' });
        const signingButton = page.getByRole('button', { name: 'Sign terms & conditions' });
        await expect(page.getByText('Requested funds')).toBeVisible();
        await expect(page.getByText('€20,000.00')).toBeVisible();
        await expect(page.getByText('Action needed')).toBeVisible();
        await expect(page.getByText('Grant ID')).toBeVisible();
        await expect(page.getByTestId('grant-id-copy-text')).toBeVisible();
        await expect(
            page.getByText('We need a bit more input from you to process your funds. Please complete these actions by February 15, 2025.')
        ).toBeVisible();
        await expect(informationSubmitButton).toBeVisible();
        await expect(informationSubmitButton).toContainClass('adyen-pe-button--tertiary');
        await expect(signingButton).toBeVisible();
        await expect(signingButton).toContainClass('adyen-pe-button--tertiary');
        await expect(page.getByRole('progressbar')).toBeHidden();
        await expect(page.getByTestId('expand-button')).toBeHidden();
    });
});
