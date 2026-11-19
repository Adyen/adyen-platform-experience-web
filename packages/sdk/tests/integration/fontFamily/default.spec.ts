import { expect, test, type Page } from '@playwright/test';

const STORY_ID = 'sdk-appearance--default';
const HOST_FONT_FAMILY = 'Comic Sans MS';

const getTypographyFontFamilies = (page: Page) =>
    page.evaluate(() => {
        const elements = document.querySelectorAll('.adyen-pe-component .b-typography:not(.b-typography--monospace)');
        return [...new Set(Array.from(elements, element => getComputedStyle(element).fontFamily))];
    });

test.describe('Font family', () => {
    test('should inherit the host font family in Bento typography', async ({ page }) => {
        await page.goto(`/iframe.html?id=${STORY_ID}&globals=fontFamily:${encodeURIComponent(HOST_FONT_FAMILY)}`);
        await expect(page.getByRole('columnheader').first()).toBeVisible();

        await expect.poll(() => getTypographyFontFamilies(page)).toEqual([`"${HOST_FONT_FAMILY}"`]);
    });
});
