import { expect, test } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-reports-reports-overview--custom-dark-theme';

test.describe('Core theme', () => {
    test.describe('Story mode', () => {
        test.beforeEach(async ({ page }) => {
            await goToStory(page, { id: STORY_ID });
        });

        test('applies dark Bento defaults and custom brand variables', async ({ page }) => {
            await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute('data-adyen-pe-theme'))).toBe('dark');

            const variables = await page.evaluate(() => {
                const styles = getComputedStyle(document.documentElement);

                return {
                    background: styles.getPropertyValue('--adyen-sdk-color-background-primary').trim(),
                    primary: styles.getPropertyValue('--adyen-sdk-color-primary').trim(),
                };
            });

            expect(variables).toEqual({
                background: '#111111',
                primary: '#0066ff',
            });

            await expect(page.getByRole('columnheader').first()).toHaveCSS('background-color', 'rgb(17, 17, 17)');
        });

        test('applies the dark Neutral surface hierarchy from the shared theme generator', async ({ page }) => {
            await page.getByRole('button', { name: 'Open theme controls' }).click();
            await page.getByRole('complementary', { name: 'Theme controls' }).getByLabel('Neutral', { exact: true }).fill('#2a2a2a');

            await expect
                .poll(() =>
                    page.evaluate(() => {
                        const styles = getComputedStyle(document.documentElement);

                        return {
                            secondary: styles.getPropertyValue('--adyen-sdk-color-background-secondary').trim(),
                            tertiary: styles.getPropertyValue('--adyen-sdk-color-background-tertiary').trim(),
                            separatorPrimary: styles.getPropertyValue('--adyen-sdk-color-separator-primary').trim(),
                            separatorSecondary: styles.getPropertyValue('--adyen-sdk-color-separator-secondary').trim(),
                        };
                    })
                )
                .toEqual({
                    secondary: '#2a2a2a',
                    tertiary: '#3a3a3a',
                    separatorPrimary: '#3a3a3a',
                    separatorSecondary: '#636363',
                });

            const firstDataRow = page.getByRole('grid').getByRole('rowgroup').nth(1).getByRole('row').first();
            await expect(firstDataRow).toHaveCSS('border-bottom-color', 'rgb(58, 58, 58)');
        });
    });

    test.describe('Global mode', () => {
        test.beforeEach(async ({ page }) => {
            await goToStory(page, {
                id: STORY_ID,
                globals: { theme: 'light' },
            });
        });

        test('overrides the story mode and preserves its brand variables', async ({ page }) => {
            const columnHeader = page.getByRole('columnheader').first();
            await expect(columnHeader).toBeVisible();
            await expect.poll(() => page.evaluate(() => document.documentElement.hasAttribute('data-adyen-pe-theme'))).toBe(false);
            await expect(columnHeader).toHaveCSS('background-color', 'rgb(255, 255, 255)');
            await expect
                .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--adyen-sdk-color-primary').trim()))
                .toBe('#0066ff');
        });
    });

    test.describe('Variable controls', () => {
        test.beforeEach(async ({ page }) => {
            await goToStory(page, {
                id: STORY_ID,
                globals: { theme: 'light' },
            });
        });

        test('opens, edits and dismisses global brand variable controls', async ({ page }) => {
            const themeControls = page.getByRole('complementary', { name: 'Theme controls' });
            const openThemeControls = page.getByRole('button', { name: 'Open theme controls' });
            const firstDataRow = page.getByRole('grid').getByRole('rowgroup').nth(1).getByRole('row').first();
            await Promise.all([expect(themeControls).toBeHidden(), expect(openThemeControls).toBeVisible()]);
            await openThemeControls.click();
            await expect(themeControls).toBeVisible();
            await Promise.all(
                ['Primary', 'Outline', 'Neutral', 'Background', 'Label'].map(label =>
                    expect(themeControls.getByLabel(label, { exact: true })).toBeVisible()
                )
            );
            const initialSeparatorColor = await firstDataRow.evaluate(element => getComputedStyle(element).borderBottomColor);

            await themeControls.getByLabel('Primary', { exact: true }).fill('#ff0000');
            await themeControls.getByLabel('Neutral', { exact: true }).fill('#00ff00');
            await themeControls.getByLabel('Background', { exact: true }).fill('#f0f0f0');

            await expect
                .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--adyen-sdk-color-primary').trim()))
                .toBe('#ff0000');
            await expect
                .poll(() =>
                    page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--adyen-sdk-color-background-secondary').trim())
                )
                .toBe('#00ff00');
            await expect.poll(() => firstDataRow.evaluate(element => getComputedStyle(element).borderBottomColor)).not.toBe(initialSeparatorColor);
            await expect(page.getByRole('columnheader').first()).toHaveCSS('background-color', 'rgb(240, 240, 240)');

            await themeControls.getByRole('button', { name: 'Reset Primary' }).click();
            await expect
                .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--adyen-sdk-color-primary').trim()))
                .toBe('#0066ff');

            const dark = themeControls.getByRole('checkbox', { name: 'Dark' });
            await expect(dark).not.toBeChecked();
            await dark.check();
            await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute('data-adyen-pe-theme'))).toBe('dark');

            await themeControls.getByRole('button', { name: 'Reset Dark' }).click();
            await expect(dark).not.toBeChecked();
            await expect.poll(() => page.evaluate(() => document.documentElement.hasAttribute('data-adyen-pe-theme'))).toBe(false);

            await themeControls.getByRole('button', { name: 'Close theme controls' }).click();
            await expect(themeControls).toBeHidden();
            await openThemeControls.click();
            await expect(themeControls).toBeVisible();
        });
    });
});
