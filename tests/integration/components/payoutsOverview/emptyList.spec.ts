import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';
import { expectDisabledPaginationButtons, expectEmptyPayoutDataGridColumns } from './shared/utils';

const STORY_ID = 'mocked-payouts-payouts-overview--empty-list';

test.describe('Empty list', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render "No payouts found" message', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('No payouts found', { exact: true })).toBeVisible(),
            expect(page.getByText('Try a different search or reset your filters, and we’ll try again.', { exact: true })).toBeVisible(),
        ]);
    });

    test('should render data grid columns', async ({ page }) => {
        await expectEmptyPayoutDataGridColumns(page);
    });

    test('should render disabled pagination buttons', async ({ page }) => {
        await expectDisabledPaginationButtons(page);
    });
});
