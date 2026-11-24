import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { expectToldState } from '../shared/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--state-restricted';

// Every reason the API tells, the most blocking first
const RESTRICTED = {
    isAvailable: true,
    restrictions: [
        'cashOutNotConfigured',
        'riskRestricted',
        'sendToBalanceAccountNotAllowed',
        'receiveFromBalanceAccountNotAllowed',
        'sendToTransferInstrumentNotAllowed',
    ],
};

test.describe('CashOut Overview - State - Restricted', () => {
    test('should tell the component is available with all its restrictions, so a platform hiding it for any does not show it', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        // Not in Promise.all: hidden is true before the story decided whether to mount the component, which it does once getState() told
        await expectToldState(page, RESTRICTED);
        await expect(getComponentRoot(page)).toBeHidden();
    });

    // Still available, so a platform that doesn't hide it for these restrictions shows it
    test('should show the component when the platform mounts it despite the restrictions', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { mountIfRestricted: 'true' } });

        await Promise.all([expectToldState(page, RESTRICTED), expect(getComponentRoot(page)).toBeVisible()]);
    });
});
