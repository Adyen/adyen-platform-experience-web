import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { REQUEST_ANALYTICS, waitForCashOutRequest } from '../shared/utils';

const STORY_ID = 'mocked-cashout-cashout-request--many-transfer-instruments';

// From 10 bank accounts, their dropdown can be searched; the ones that can't receive the cashOut count too, as they are listed
test.describe('CashOut Request - Many transfer instruments', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', REQUEST_ANALYTICS]]);
    });

    test('should list the bank accounts that match the search, the ones that cannot receive the cashOut still disabled', async ({ page }) => {
        const root = getComponentRoot(page);
        const selector = root.getByRole('combobox', { name: 'Account to deposit into' });

        await selector.click();
        await expect(root.getByRole('option')).toHaveCount(12);

        await selector.fill('GB');
        const options = root.getByRole('option');

        await expect(options).toHaveCount(3);
        await Promise.all([
            expect(options.nth(0)).toHaveAccessibleName('GB**NWBK**********1234'),
            expect(options.nth(0)).toBeEnabled(),
            expect(options.nth(1)).toHaveAccessibleName('NL**INGB******2202'),
            expect(options.nth(1)).toBeEnabled(),
            expect(options.nth(2)).toHaveAccessibleName("GB**BARC**********5432 This account can't receive instant payouts"),
            expect(options.nth(2)).toBeDisabled(),
        ]);
    });

    test('should tell when no bank account matches the search', async ({ page }) => {
        const root = getComponentRoot(page);
        const selector = root.getByRole('combobox', { name: 'Account to deposit into' });

        await selector.click();
        await selector.fill('9999');

        await Promise.all([expect(root.getByText('No options match this search')).toBeVisible(), expect(root.getByRole('option')).toHaveCount(0)]);
    });

    test('should cash out to the bank account found', async ({ page }) => {
        const root = getComponentRoot(page);
        const selector = root.getByRole('combobox', { name: 'Account to deposit into' });

        await selector.click();
        await selector.fill('7707');
        await root.getByRole('option', { name: 'IT**UNCR**********7707' }).click();

        const cashOutRequest = waitForCashOutRequest(page);
        await root.getByRole('button', { name: 'Cash out now' }).click();

        expect((await cashOutRequest).postDataJSON()).toMatchObject({ counterparty: { transferInstrumentId: 'SE322QG223222F5GXZFNM9H3X' } });
        await expect(root.getByText('CashOut successful')).toBeVisible();
    });

    test('should tell a bank account was selected from a search', async ({ page, analyticsEvents }) => {
        const root = getComponentRoot(page);
        const selector = root.getByRole('combobox', { name: 'Account to deposit into' });

        await selector.click();
        await selector.fill('GB');
        await root.getByRole('option', { name: 'GB**NWBK**********1234' }).click();

        await expectAnalyticsEvents(analyticsEvents, [['Changed bank account', { ...REQUEST_ANALYTICS, usedSearch: true, bankAccountCount: '10+' }]]);
    });
});
