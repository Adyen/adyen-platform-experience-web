import { test as base, expect } from '@playwright/test';
import { CUSTOM_URL_EXAMPLE } from '../../../../stories/utils/constants';
import { TransactionsOverviewPage } from '../../../models/external-components/transactionsOverview.page';
import { getTranslatedKey, goToStory } from '../../../utils/utils';
import dotenv from 'dotenv';

dotenv.config({ path: './envs/.env' });

const COMPONENT_PREFIX = 'mocked-transactions-transactions-overview';

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
    await transactionsOverview.getCell('netAmount').waitFor();
    await transactionsOverview.firstRow.click();

    const detailsModal = page.getByRole('dialog');
    await detailsModal.getByRole('tab', { name: 'Details', exact: true }).click();

    const referenceID = detailsModal.getByTestId(`${getTranslatedKey('transactions.details.fields.referenceID')}`).locator('dd');
    await expect(referenceID).toHaveText('B78I76Y77072H127');
});
