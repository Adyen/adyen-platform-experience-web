import { test, expect, type Request } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { expectToldState, recordRequests } from '../shared/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--state-error';

let stateRequests: Request[];

test.beforeEach(async ({ page }) => {
    stateRequests = recordRequests(page, '/cashout/state');
    await goToStory(page, { id: STORY_ID });
});

// getState() tells the component isn't available when the state can't be told, so the platform doesn't show it
test.describe('CashOut Overview - State - Error', () => {
    test('should tell the component is not available, without restrictions, and not show it', async ({ page }) => {
        await expectToldState(page, { isAvailable: false });

        await expect.poll(() => Promise.all(stateRequests.map(async request => (await request.response())?.status()))).toEqual([500]);
        // Not in Promise.all with the state told: hidden is true before the story decided whether to mount the component
        await expect(getComponentRoot(page)).toBeHidden();
    });
});
