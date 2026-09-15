import { expect, test, type Page } from '@playwright/test';
import { goToStory, updateStoryArgs } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-reports-reports-overview--default';

const getThemeState = (page: Page) =>
    page.evaluate(() => {
        const styles = getComputedStyle(document.documentElement);

        return {
            mode: document.documentElement.getAttribute('data-adyen-pe-theme'),
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
});
