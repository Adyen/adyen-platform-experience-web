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
    await transactionsOverview.applyDateFilter('2024-01-01');
    await transactionsOverview.getCell('amount').waitFor();
    await transactionsOverview.firstRow.click();

    const referenceID = page
        .getByRole('dialog')
        .getByTestId(`${getTranslatedKey('transactions.details.fields.referenceID')}`)
        .locator('dd');
    await expect(referenceID).toHaveText('8W54BM75W7DYCIVK');
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

test.describe('Transaction details modal with partial refunds', () => {
    test.beforeEach(async ({ transactionsOverviewPage, page }) => {
        const transactionsOverview = transactionsOverviewPage;
        await goToStory(page, { id: `${COMPONENT_PREFIX}--default` });
        await transactionsOverview.applyDateFilter('2024-01-01');
        await transactionsOverview.getCell('amount').waitFor();
        await transactionsOverview.firstRow.click();
    });

    test('should show refund details', async ({ page }) => {
        await expect(page.getByText(getTranslatedKey('transactions.details.common.refundedStates.partial'))).toBeVisible();
        await expect(page.getByText('You already refunded €5.00')).toBeVisible();
        await expect(page.getByText('The partial refund of €15.00 and €5.00 is being processed.')).toBeVisible();
        await expect(
            page.getByText(
                'The refund for €2.00, €2.00, and €1.00 has failed. It is not currently possible to refund this amount. Please contact support.'
            )
        ).toBeVisible();
    });

    test('should render refund button', async ({ page }) => {
        const refundButton = page.getByLabel(getTranslatedKey('transactions.details.actions.refund'));
        await expect(refundButton).toHaveText('Refund payment');
    });
});

test.describe('Refund action modal', () => {
    test.beforeEach(async ({ transactionsOverviewPage, page }) => {
        const transactionsOverview = transactionsOverviewPage;
        await goToStory(page, { id: `${COMPONENT_PREFIX}--default` });
        await transactionsOverview.applyDateFilter('2024-01-01');
        await transactionsOverview.getCell('amount').waitFor();
        await transactionsOverview.firstRow.click();
        const refundButton = page.getByLabel(getTranslatedKey('transactions.details.actions.refund'));
        await refundButton.click();
    });

    test('should show correct initial value', async ({ page }) => {
        const refundReasonDropdown = page.getByTitle(getTranslatedKey('transactions.details.common.refundReasons.requestedByCustomer'));
        await expect(refundReasonDropdown).toBeVisible();
        await refundReasonDropdown.click();
        const refundReasonDropdownOptions = await page.getByRole('option').allInnerTexts();
        expect(refundReasonDropdownOptions).toStrictEqual([
            getTranslatedKey('transactions.details.common.refundReasons.requestedByCustomer'),
            getTranslatedKey('transactions.details.common.refundReasons.issueWithItemSold'),
            getTranslatedKey('transactions.details.common.refundReasons.fraudulent'),
            getTranslatedKey('transactions.details.common.refundReasons.duplicate'),
            getTranslatedKey('transactions.details.common.refundReasons.other'),
        ]);
        const refundActionButton = page.getByLabel('Refund €10.00');
        await expect(refundActionButton).toHaveText('Refund €10.00');
        const refundInput = page.locator('input');
        await expect(refundInput).toHaveValue('10.00');
    });

    test('should show an error if the refund amount is incorrect', async ({ page }) => {
        const refundActionButton = page.getByLabel('Refund €10.00');
        const refundInput = page.locator('input');
        await refundInput.fill('11');
        await expect(page.getByText('You cannot exceed the available amount of €10.00')).toBeVisible();
        await refundInput.fill('');
        await expect(page.getByText('Enter a refund amount')).toBeVisible();
        expect(refundActionButton.isDisabled()).toBeTruthy();
    });

    test('should successfully complete refund action and go back to details modal', async ({ page }) => {
        const refundActionButton = page.getByLabel('Refund €10.00');
        await refundActionButton.click();
        await expect(page.getByText(getTranslatedKey('transactions.details.refund.alerts.refundSent'))).toBeVisible();
        await expect(page.getByText(getTranslatedKey('transactions.details.refund.alerts.refundSuccess'))).toBeVisible();

        const goBackButton = page.getByRole('button', { name: getTranslatedKey('transactions.details.refund.actions.back') });
        await goBackButton.click();
        const referenceID = page
            .getByRole('dialog')
            .getByTestId(`${getTranslatedKey('transactions.details.fields.referenceID')}`)
            .locator('dd');
        await expect(referenceID).toHaveText('8W54BM75W7DYCIVK');
    });
});
