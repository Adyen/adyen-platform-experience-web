import { test } from '@playwright/test';
import { expectBalanceAccountPaginationReset, goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-disputes-disputes-overview--default';

test.describe('Default', () => {
    test('should reset pagination when selecting another balance account', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await expectBalanceAccountPaginationReset({ endpointPath: '/disputes', page, variant: 'Default' });
    });
});
