import { test as base, expect } from '@playwright/test';
import { TransactionDetailsPage } from '../../../models/external-components/transactionDetails.page';
import { goToPage } from '../../../utils/utils';

const COMPONENT_PREFIX = 'mocked-transaction-details';

const test = base.extend<{
    transactionDetailsPage: TransactionDetailsPage;
}>({
    transactionDetailsPage: async ({ page }, use) => {
        const transactionDetailsPage = new TransactionDetailsPage(page);
        await use(transactionDetailsPage);
    },
});

test('balance account should show correct ID', async ({ transactionDetailsPage, page }) => {
    await goToPage({ page, id: `${COMPONENT_PREFIX}--default` });
    const transactionDetails = transactionDetailsPage;

    await expect(transactionDetails.transactionValue).toHaveText('1VVF0D5V3709DX6D');
});
