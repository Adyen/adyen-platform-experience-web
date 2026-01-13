import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-capital-capital-overview--unqualified';

test.describe('Unqualified', () => {
    test('should render unqualified screen', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await expect(page.getByText('Need some extra money?')).toBeVisible();
        await expect(page.getByText('Loans are issued by Adyen N.V.')).toBeVisible();
        await expect(page.getByText('You will soon qualify for a financial offer!')).toBeVisible();
    });
});

test.describe('mountIfUnqualified argument', () => {
    test('should not render the component when argument is false', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { mountIfUnqualified: 'false' } });
        await expect(page.getByText('Need some extra money?')).toBeHidden();
    });
});
