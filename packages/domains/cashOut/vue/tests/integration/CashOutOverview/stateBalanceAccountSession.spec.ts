import { test, expect, type Request } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { expectToldState, recordRequests } from '../shared/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--state-balance-account-session';

let stateRequests: Request[];

test.beforeEach(async ({ page }) => {
    stateRequests = recordRequests(page, '/cashout/state');
    await goToStory(page, { id: STORY_ID });
});

// The API tells the state of the account holder of that balance account
test.describe('CashOut Overview - State - Balance account session', () => {
    test('should ask cashout-ui once for the state of the balance account of the session', async ({ page }) => {
        await expectToldState(page, { isAvailable: true, restrictions: [] });

        await expect
            .poll(() => stateRequests.map(request => new URL(request.url()).pathname))
            .toEqual(['/cashout-ui/api/v1/BalanceAccount.BA32272223222B5CTDQPM6W2H/cashout/state']);
    });

    test('should tell the component is available without restrictions, so the platform shows it', async ({ page }) => {
        await Promise.all([expectToldState(page, { isAvailable: true, restrictions: [] }), expect(getComponentRoot(page)).toBeVisible()]);
    });
});
