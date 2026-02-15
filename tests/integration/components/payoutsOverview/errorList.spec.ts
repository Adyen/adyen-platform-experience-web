import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';
import { expectDisabledPaginationButtons, expectEmptyPayoutDataGridColumns } from './shared/utils';

const STORY_ID = 'mocked-payouts-payouts-overview--error-list';

test.describe('Error - list', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render error message', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible(),
            expect(page.getByText("We couldn't load your payouts. Try refreshing the page or come back later.")).toBeVisible(),
            expect(page.getByRole('button', { name: 'Refresh', exact: true, disabled: false })).toBeVisible(),
        ]);
    });

    test('should render data grid columns', async ({ page }) => {
        await expectEmptyPayoutDataGridColumns(page);
    });

    test('should render disabled pagination buttons', async ({ page }) => {
        await expectDisabledPaginationButtons(page);
    });
});
