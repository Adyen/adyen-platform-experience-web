import { test as base, expect } from '@playwright/test';
import { TransactionDetailsPage } from '../../../models/external-components/transactionDetails.page';
import { AccessibilityTestUtility } from '../../../utils/a11y';
import { goToStory } from '../../../utils/utils';

const COMPONENT_PREFIX = 'mocked-transaction-details';

const test = base.extend<{
    transactionDetailsPage: TransactionDetailsPage;
    a11y: AccessibilityTestUtility;
}>({
    transactionDetailsPage: async ({ page }, use) => {
        const transactionDetailsPage = new TransactionDetailsPage(page);
        await use(transactionDetailsPage);
    },
    a11y: async ({ page }, use) => {
        const a11y = new AccessibilityTestUtility(page);
        await use(a11y);
    },
});

test('should be accessible', async ({ a11y, page }) => {
    await goToStory(page, { id: `${COMPONENT_PREFIX}--default` });
    await a11y.expectToPass();
});

test('balance account should show correct ID', async ({ transactionDetailsPage, page }) => {
    await goToStory(page, { id: `${COMPONENT_PREFIX}--default` });
    await expect(transactionDetailsPage.transactionValue).toHaveText('1VVF0D5V3709DX6D');
    const copyIcon = page.getByTestId('copy-icon');
    await expect(copyIcon).toBeVisible();
});
