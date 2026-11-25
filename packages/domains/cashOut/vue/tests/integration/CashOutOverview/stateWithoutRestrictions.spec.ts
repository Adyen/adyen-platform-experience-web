import { test, expect, type Request } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { expectToldState, recordRequests } from '../shared/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--state-without-restrictions';

let stateRequests: Request[];

test.beforeEach(async ({ page }) => {
    stateRequests = recordRequests(page, '/cashout/state');
    await goToStory(page, { id: STORY_ID });
});

test.describe('CashOut Overview - State - Without restrictions', () => {
    test('should ask cashout-ui once for the state of the account holder of the session', async ({ page }) => {
        await expectToldState(page, { isAvailable: true, restrictions: [] });

        await expect
            .poll(() => stateRequests.map(request => new URL(request.url())).map(({ host, pathname }) => `${host}${pathname}`))
            .toEqual(['cashout-ui-test.adyen.com/cashout-ui/api/v1/BalanceAccountHolder.AH32272223222B5CTDQPM6W2H/cashout/state']);
    });

    test('should tell the component is available without restrictions, so the platform shows it', async ({ page }) => {
        await Promise.all([
            expectToldState(page, { isAvailable: true, restrictions: [] }),
            expect(getComponentRoot(page).getByRole('button', { name: 'Start instant CashOut' })).toBeEnabled(),
        ]);
    });
});
