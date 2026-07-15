import { expect, type Locator, type Page } from '@playwright/test';

type CustomDisputeDetailsOptions = {
    root: Locator | Page;
    summaryLinkName: string;
    hiddenLabels?: string[];
};

export async function expectCustomDisputeDetails({ root, summaryLinkName, hiddenLabels = [] }: CustomDisputeDetailsOptions) {
    const summaryLink = root.getByRole('link', { name: summaryLinkName, exact: true, disabled: false });
    const actionButton = root.getByRole('button', { name: 'Send email', exact: true, disabled: false });

    await Promise.all([
        expect(root.getByText('Store', { exact: true })).toBeVisible(),
        expect(root.getByText('Sydney', { exact: true })).toBeVisible(),
        expect(root.getByText('Product', { exact: true })).toBeVisible(),
        expect(root.getByText('Coffee', { exact: true })).toBeVisible(),
        expect(summaryLink).toBeVisible(),
        expect(root.getByText('Country', { exact: true })).toBeVisible(),
        expect(root.getByAltText('', { exact: true })).toBeAttached(),
        expect(actionButton).toBeVisible(),
    ]);

    for (const label of hiddenLabels) {
        await expect(root.getByText(label, { exact: true })).not.toBeVisible();
    }

    return { actionButton, summaryLink };
}
