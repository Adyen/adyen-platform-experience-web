import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export const goToTab = async (page: Page, name: 'Active' | 'Inactive') => {
    await page.getByRole('tab', { name, exact: true }).click();
    await expect(page.getByRole('tab', { name, exact: true })).toHaveAttribute('aria-selected', 'true');
};

export const applyTextFilter = async (page: Page, filterName: string, value: string) => {
    await page.getByRole('button', { name: filterName }).click();
    await page.getByRole('textbox').fill(value);
    await page.getByRole('button', { name: 'Apply' }).click();
};

export const openCreatePaymentLinkModal = async (page: Page): Promise<Locator> => {
    await page.getByRole('button', { name: 'Create payment link' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    return dialog;
};

export const openSettingsModal = async (page: Page): Promise<Locator> => {
    await page.getByRole('button', { name: /settings/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    return dialog;
};
