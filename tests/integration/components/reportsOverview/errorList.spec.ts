import { test, expect } from '@playwright/test';
import { getTranslatedKey, goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-reports-reports-overview--error-list';

test.describe('Error - list', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should show error message', async ({ page }) => {
        const errorMessage = page.locator('p').filter({ hasText: getTranslatedKey('reports.overview.errors.listUnavailable') });

        await Promise.all([
            expect(page.getByText(getTranslatedKey('common.errors.somethingWentWrong'), { exact: true })).toBeVisible(),
            expect(errorMessage).toContainText(getTranslatedKey('reports.overview.errors.listUnavailable')),
            expect(errorMessage).toContainText(getTranslatedKey('common.errors.retry')),
            expect(page.getByRole('button', { name: getTranslatedKey('common.actions.refresh.labels.default'), exact: true })).toBeVisible(),
        ]);
    });
});
