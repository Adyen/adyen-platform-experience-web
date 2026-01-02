import { test as base, expect } from '@playwright/test';
import { CUSTOM_URL_EXAMPLE } from '../../../../stories/utils/constants';
import { TransactionsOverviewPage } from '../../../models/external-components/transactionsOverview.page';
import { getTranslatedKey, goToStory } from '../../../utils/utils';
import dotenv from 'dotenv';

dotenv.config({ path: './envs/.env' });

const COMPONENT_PREFIX = 'mocked-transactions-overview';

const test = base.extend<{
    transactionsOverviewPage: TransactionsOverviewPage;
}>({
    transactionsOverviewPage: async ({ page }, use) => {
        const transactionsOverviewPage = new TransactionsOverviewPage(page);
        await use(transactionsOverviewPage);
    },
});

test('cells should show correct value and open correct modal ', async ({ transactionsOverviewPage, page }) => {
    const transactionsOverview = transactionsOverviewPage;
    await goToStory(page, { id: `${COMPONENT_PREFIX}--default` });
    await transactionsOverview.getCell('amount').waitFor();
    await transactionsOverview.firstRow.click();

    const referenceID = page
        .getByRole('dialog')
        .getByTestId(`${getTranslatedKey('transactions.details.fields.referenceID')}`)
        .locator('dd');
    await expect(referenceID).toHaveText('B78I76Y77072H127');
});

test.describe('Filters', () => {
    test('all filters should be attached', async ({ transactionsOverviewPage, page }) => {
        await goToStory(page, { id: `${COMPONENT_PREFIX}--default` });
        const transactionsOverview = transactionsOverviewPage;
        await expect(transactionsOverview.filterBar).toBeAttached();
        await expect(transactionsOverview.dateFilter).toBeAttached();
    });

    //TODO test('filtering by date range should work')
});

test.describe('Transaction List with data customization', () => {
    test('should render extra columns', async ({ context, transactionsOverviewPage, page }) => {
        await goToStory(page, { id: `${COMPONENT_PREFIX}--data-customization` });
        const transactionsOverview = transactionsOverviewPage;

        // _product (TEXT TYPE)
        const productFirstRow = transactionsOverview.getCell('_product', 0);
        await expect(productFirstRow).toHaveText('Bubble tea');

        // _store (ICON TYPE)
        const storeFirstRow = transactionsOverview.getCell('_store', 0);
        await expect(storeFirstRow).toHaveText('Sydney');
        await expect(storeFirstRow.getByRole('img')).toBeAttached();

        // _reference: (LINK TYPE)
        const referenceFirstRow = transactionsOverview.getCell('_reference', 0);
        const REFERENCE = '8W54BM75W7DYCIVK';
        await expect(referenceFirstRow).toHaveText(REFERENCE);

        //hidden column
        const transactionTypeFirstRow = transactionsOverview.getCell('transactionType', 0);
        await expect(transactionTypeFirstRow).not.toBeAttached();

        const [newPage] = await Promise.all([
            context.waitForEvent('page'), // Waits for a new 'page' event in this browser context
            referenceFirstRow.click(), // This click opens the link in a new tab
        ]);
        await newPage.waitForLoadState();
        expect(newPage.url()).toContain(CUSTOM_URL_EXAMPLE);

        // _action (BUTTON TYPE)
        const messages: string[] = [];
        page.on('console', message => {
            messages.push(message.text());
        });
        const actionFirstRow = transactionsOverview.getCell('_button', 0);
        await actionFirstRow.getByRole('button').click();

        expect(messages).toContain('Action');
    });
});
