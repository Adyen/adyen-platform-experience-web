import { test as base, expect } from '@playwright/test';
import { TransactionListPage } from '../../../models/external-components/transactionList.page';
import { getTranslatedKey, goToPage } from '../../../utils/utils';
import dotenv from 'dotenv';

dotenv.config({ path: './envs/.env' });

const COMPONENT_PREFIX = 'mocked-transactions-list';

const test = base.extend<{
    transactionListPage: TransactionListPage;
}>({
    transactionListPage: async ({ page }, use) => {
        const transactionListPage = new TransactionListPage(page);
        await use(transactionListPage);
    },
});

test('cells should show correct value and open correct modal ', async ({ transactionListPage, page }) => {
    const transactionList = transactionListPage;
    await goToPage({ page, id: `${COMPONENT_PREFIX}--basic` });
    await transactionList.applyDateFilter('2024-01-01');
    await transactionList.getCell('amount').waitFor();
    await transactionList.firstRow.click();

    const referenceID = transactionList.page.getByRole('dialog').getByLabel(`${getTranslatedKey('referenceID')}`);
    await expect(referenceID).toHaveText('8W54BM75W7DYCIVK');
});

test.describe('Filters', () => {
    test('all filters should be attached', async ({ transactionListPage, page }) => {
        await goToPage({ page, id: `${COMPONENT_PREFIX}--basic` });
        const transactionList = transactionListPage;
        await expect(transactionList.filterBar).toBeAttached();
        await expect(transactionList.dateFilter).toBeAttached();
    });

    //TODO test('filtering by date range should work')
});

test.describe('Transaction List with custom columns', () => {
    test('Extra columns should be rendered', async ({ transactionListPage, page }) => {
        await goToPage({ page, id: `${COMPONENT_PREFIX}--custom-columns` });
        const transactionList = transactionListPage;
        await expect(transactionList.getHeader('Store')).toBeAttached();
        await expect(transactionList.getHeader('Product')).toBeAttached();
        await expect(transactionList.getHeader('Reference')).toBeAttached();
    });

    test('Extra columns values should render with string or the format {value: string}', async ({ transactionListPage, page }) => {
        await goToPage({ page, id: `${COMPONENT_PREFIX}--custom-columns` });
        const transactionList = transactionListPage;

        // _store: { value: string; icon: { url: string } }
        const storeFirstRow = transactionList.getCell('_store', 0);
        await expect(storeFirstRow).toHaveText('Sydney');
        await expect(storeFirstRow.getByRole('img')).toBeAttached();

        // _reference: string
        const referenceFirstRow = transactionList.getCell('_reference', 0);
        await expect(referenceFirstRow).toHaveText('8W54BM75W7DYCIVK');
    });

    test('Columns should be reordered', async ({ transactionListPage, page }) => {
        await goToPage({ page, id: `${COMPONENT_PREFIX}--custom-order` });
        const transactionList = transactionListPage;
        const headers = transactionList.dataGrid.rootElement.getByRole('columnheader');
        await expect(headers.nth(0)).toHaveText('Transaction type');
        await expect(headers.nth(1)).toHaveText('Payment method');
        await expect(headers.nth(2)).toHaveText('Date');
        await expect(headers.nth(3)).toHaveText('Amount');
    });
});

test.describe('Transaction details modal with partial refunds', () => {
    test.beforeEach(async ({ transactionListPage, page }) => {
        const transactionList = transactionListPage;
        await goToPage({ page, id: `${COMPONENT_PREFIX}--basic` });
        await transactionList.applyDateFilter('2024-01-01');
        await transactionList.getCell('amount').waitFor();
        await transactionList.firstRow.click();
    });

    test('should show refund details', async ({ transactionListPage, page }) => {
        await expect(page.getByText(getTranslatedKey('refunded.partial'))).toBeVisible();
        await expect(page.getByText('You already refunded €5.00')).toBeVisible();
        await expect(page.getByText('The partial refund of €15.00 and €5.00 is being processed.')).toBeVisible();
        await expect(
            page.getByText(
                'The refund for €2.00, €2.00 and €1.00 has failed. It is not currently possible to refund this amount. Please contact support.'
            )
        ).toBeVisible();
    });

    test('should render refund button', async ({ transactionListPage }) => {
        const refundButton = transactionListPage.page.getByLabel(getTranslatedKey('refundAction'));
        await expect(refundButton).toHaveText('Refund payment');
    });
});

test.describe('Refund action modal', () => {
    test.beforeEach(async ({ transactionListPage, page }) => {
        const transactionList = transactionListPage;
        await goToPage({ page, id: `${COMPONENT_PREFIX}--basic` });
        await transactionList.applyDateFilter('2024-01-01');
        await transactionList.getCell('amount').waitFor();
        await transactionList.firstRow.click();
        const refundButton = transactionList.page.getByLabel(getTranslatedKey('refundAction'));
        await refundButton.click();
    });

    test('should show correct initial value', async ({ transactionListPage }) => {
        const refundReasonDropdown = transactionListPage.page.getByTitle(getTranslatedKey('refundReason.requested_by_customer'));
        await expect(refundReasonDropdown).toBeVisible();
        await refundReasonDropdown.click();
        const refundReasonDropdownOptions = await transactionListPage.page.getByRole('option').allInnerTexts();
        expect(refundReasonDropdownOptions).toStrictEqual([
            getTranslatedKey('refundReason.requested_by_customer'),
            getTranslatedKey('refundReason.issue_with_item_sold'),
            getTranslatedKey('refundReason.fraudulent'),
            getTranslatedKey('refundReason.duplicate'),
            getTranslatedKey('refundReason.other'),
        ]);
        const refundActionButton = transactionListPage.page.getByLabel('Refund €10.00');
        await expect(refundActionButton).toHaveText('Refund €10.00');
        const refundInput = transactionListPage.page.locator('input');
        await expect(refundInput).toHaveValue('10.00');
    });

    test('should show an error if the refund amount is incorrect', async ({ transactionListPage, page }) => {
        const refundActionButton = transactionListPage.page.getByLabel('Refund €10.00');
        const refundInput = transactionListPage.page.locator('input');
        await refundInput.fill('11');
        await expect(page.getByText('You cannot exceed the available amount of €10.00')).toBeVisible();
        await refundInput.fill('');
        await expect(page.getByText('Enter a refund amount')).toBeVisible();
        expect(refundActionButton.isDisabled()).toBeTruthy();
    });

    test('should successfully complete refund action and go back to details modal', async ({ transactionListPage, page }) => {
        const refundActionButton = transactionListPage.page.getByLabel('Refund €10.00');
        await refundActionButton.click();
        await expect(page.getByText(getTranslatedKey('refundActionSuccessTitle'))).toBeVisible();
        await expect(page.getByText(getTranslatedKey('refundActionSuccessSubtitle'))).toBeVisible();

        const goBackButton = transactionListPage.page.getByRole('button', { name: getTranslatedKey('goBack') });
        await goBackButton.click();
        const referenceID = transactionListPage.page.getByRole('dialog').getByLabel(`${getTranslatedKey('referenceID')}`);
        await expect(referenceID).toHaveText('8W54BM75W7DYCIVK');
    });
});
