import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-overview--pending-loan';

test.describe('Pending - Loan', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render pending loan', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('Requested funds')).toBeVisible(),
            expect(page.getByText('€20,000.00')).toBeVisible(),
            expect(page.getByText('Pending')).toBeVisible(),
            expect(page.getByText('Grant ID')).toBeVisible(),
            expect(page.getByRole('button', { name: 'Copy grant ID' })).toBeVisible(),
            expect(page.getByText('We received your request and we’re working on it now. Check back soon for the next steps.')).toBeVisible(),
            expect(page.getByRole('progressbar')).toBeHidden(),
            expect(page.getByRole('button', { name: 'Show details' })).toBeHidden(),
        ]);
    });

    test('should render the relevant tooltip when status tag is hovered', async ({ page }) => {
        await page.getByText('Pending').hover();
        await expect(page.getByRole('tooltip', { name: 'You should get your funds within one business day' })).toBeVisible();
    });

    test('should render a tooltip with the loan ID when the id label is hovered', async ({ page }) => {
        await page.getByText('Grant ID').hover();
        await expect(page.getByRole('tooltip', { name: '66e12a9a64a6' })).toBeVisible();
    });
});
