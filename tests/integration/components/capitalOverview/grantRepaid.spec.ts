import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';

const sharedAnalyticsEventProperties = {
    componentName: 'capitalOverview',
    category: 'Capital overview component',
    subCategory: 'Grants overview',
    label: 'Capital overview',
} as const;

const STORY_ID = 'mocked-capital-capital-overview--grant-repaid';

test.describe('Grant: Repaid', () => {
    test('should render repaid grant', async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedAnalyticsEventProperties]]);
        await expect(page.getByText('Requested funds')).toBeVisible();
        await expect(page.getByText('€20,000.00')).toBeVisible();
        await expect(page.getByText('Fully repaid')).toBeVisible();
        await expect(page.getByText('Grant ID')).toBeVisible();
        await expect(page.getByTestId('grant-id-copy-text')).toBeVisible();
        await expect(page.getByRole('progressbar')).toBeHidden();
        await expect(page.getByTestId('expand-button')).toBeHidden();
    });
});
