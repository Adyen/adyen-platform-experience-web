import { expect, test, type Page } from '@playwright/test';
import { goToStory, updateStoryArgs } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-reports-reports-overview--default';

const getThemeState = (page: Page) =>
    page.evaluate(() => {
        const root = document.querySelector('[data-adyen-pe-theme-root]');
        if (!root) return;

        const styles = getComputedStyle(root);

        return {
            mode: root.getAttribute('data-adyen-pe-theme'),
            background: styles.getPropertyValue('--adyen-sdk-color-background-primary').trim(),
            primary: styles.getPropertyValue('--adyen-sdk-color-primary').trim(),
        };
    });

test.describe('Core theme', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await expect(page.getByRole('columnheader').first()).toBeVisible();
    });

    test('applies dark Bento defaults and custom brand variables', async ({ page }) => {
        await updateStoryArgs(page, STORY_ID, {
            coreOptions: {
                themeMode: 'dark',
                customTheme: {
                    dark: {
                        background: '#111111',
                        primary: '#0066ff',
                    },
                },
            },
        });

        await expect
            .poll(() => getThemeState(page))
            .toEqual({
                mode: 'dark',
                background: '#111111',
                primary: '#0066ff',
            });
        await expect(page.getByRole('columnheader').first()).toHaveCSS('background-color', 'rgb(17, 17, 17)');
    });

    test('applies the Core theme to filter dialogs teleported to the document body', async ({ page }) => {
        await updateStoryArgs(page, STORY_ID, {
            coreOptions: {
                themeMode: 'dark',
                customTheme: {
                    dark: {
                        background: '#111111',
                    },
                },
            },
        });

        const themeRoot = page.locator('[data-adyen-pe-theme-root]');
        const filterDialog = page.getByRole('dialog', { name: 'Date range', exact: true });

        await page.getByRole('button', { name: /^Date range/, disabled: false }).click();
        await expect(filterDialog).toBeVisible();
        await expect(themeRoot.locator('[role="dialog"]')).toHaveCount(0);
        await expect(filterDialog).toHaveCSS('--adyen-sdk-color-background-primary', '#111111');
        await expect(filterDialog).toHaveCSS('background-color', 'rgb(22, 22, 22)');
    });

    test('updates and resets public theme options', async ({ page }) => {
        const initialTheme = await getThemeState(page);

        await updateStoryArgs(page, STORY_ID, {
            coreOptions: {
                themeMode: 'light',
                customTheme: {
                    light: {
                        background: '#f0f0f0',
                        primary: '#ff0000',
                    },
                },
            },
        });

        await expect
            .poll(() => getThemeState(page))
            .toEqual({
                mode: null,
                background: '#f0f0f0',
                primary: '#ff0000',
            });
        await expect(page.getByRole('columnheader').first()).toHaveCSS('background-color', 'rgb(240, 240, 240)');

        await updateStoryArgs(page, STORY_ID, {
            coreOptions: {
                themeMode: undefined,
                customTheme: undefined,
            },
        });

        await expect.poll(() => getThemeState(page)).toEqual(initialTheme);
    });

    test('reapplies light defaults on a light theme root nested inside a dark root', async ({ page }) => {
        await updateStoryArgs(page, STORY_ID, {
            coreOptions: {
                themeMode: 'dark',
            },
        });
        await expect.poll(() => getThemeState(page)).toMatchObject({ mode: 'dark' });

        const nestedBackground = await page.evaluate(() => {
            const outerRoot = document.querySelector('[data-adyen-pe-theme-root]');
            if (!outerRoot) return;

            const nestedRoot = document.createElement('div');
            nestedRoot.setAttribute('data-adyen-pe-theme-root', 'nested-light-core');
            outerRoot.appendChild(nestedRoot);

            return getComputedStyle(nestedRoot).getPropertyValue('--adyen-sdk-color-background-primary').trim();
        });

        expect(nestedBackground).toBe('#ffffff');
    });
});
