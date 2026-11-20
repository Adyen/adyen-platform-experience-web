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

            return getComputedStyle(nestedRoot).getPropertyValue('--adyen-pe-bento-color-background-primary').trim();
        });

        expect(nestedBackground).toBe('#ffffff');
    });

    test('sets no public theme variables outside its theme roots, so other Adyen SDKs on the page keep their own', async ({ page }) => {
        const pageVariables = await page.evaluate(() => {
            const styles = getComputedStyle(document.documentElement);
            return ['--adyen-sdk-color-background-primary', '--adyen-sdk-color-label-primary', '--adyen-sdk-color-outline-primary'].map(name =>
                styles.getPropertyValue(name).trim()
            );
        });

        expect(pageVariables).toEqual(['', '', '']);
    });

    test('applies public variables a merchant sets on the page', async ({ page }) => {
        await page.evaluate(() => document.documentElement.style.setProperty('--adyen-sdk-color-background-primary', '#123456'));

        await expect(page.getByRole('columnheader').first()).toHaveCSS('background-color', 'rgb(18, 52, 86)');
    });
});
