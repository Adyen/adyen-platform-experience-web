import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-capital-capital-overview--unsupported-region';

test.describe('Unsupported region', () => {
    test('should render unsupported region screen', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await expect(page.getByText('Business financing', { exact: true })).toBeVisible();
        await expect(page.getByText('Stay tuned!')).toBeVisible();
        await expect(page.getByText('Business financing isn’t available in your region yet, but check back here for an offer.')).toBeVisible();
    });
});

test.describe('mountIfInUnsupportedRegion argument', () => {
    test('should not render the component when argument is false', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { mountIfInUnsupportedRegion: 'false' } });
        await expect(page.getByText('Business financing')).toBeHidden();
    });
});
