import { expect, test } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-dispute-management--defense-server-error';

test.describe('Error - Defense server error', () => {
    test('should render an error message', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await page.getByRole('button', { name: 'Defend chargeback' }).click();
        await page.getByRole('button', { name: 'Continue' }).click();
        // TODO - Handle the submit button correctly once we have FE validation
        await page.getByRole('button', { name: 'Submit' }).click();

        await expect(page.getByText('Something went wrong')).toBeVisible();
        await expect(
            page.getByText("We couldn't process this dispute. Please try again, or contact support if you continue to have problems.")
        ).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible();
        await page.getByRole('button', { name: 'Go back' }).click();

        await expect(page.getByText('Upload documents that support your dispute defense. Once submitted, no changes can be made.')).toBeVisible();
    });
});
