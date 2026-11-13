import { expect, test, type Page } from '@playwright/test';
import { goToStory, updateStoryArgs } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'sdk-appearance--default';

const getContainer = (page: Page) => page.getByTestId('component-container');

const goToStoryWithGlobalContainer = async (page: Page, container?: 'hidden' | 'visible') => {
    if (container) await page.goto(`/iframe.html?id=${STORY_ID}&globals=container:${container}`);
    else await goToStory(page, { id: STORY_ID });
    await expect(page.getByRole('columnheader').first()).toBeVisible();
};

const expectContainerStyles = async (page: Page, hidden: boolean) => {
    const container = getContainer(page);
    const assertion = hidden ? expect(container) : expect(container).not;

    await assertion.toHaveCSS('padding-top', '0px');
    await assertion.toHaveCSS('padding-left', '0px');
    await assertion.toHaveCSS('border-top-width', '0px');
    await assertion.toHaveCSS('border-top-left-radius', '0px');
    await assertion.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
};

test.describe('Appearance container', () => {
    test.beforeEach(async ({ page }) => {
        // The border and border radius only apply from the small breakpoint upwards.
        await page.setViewportSize({ width: 1280, height: 800 });
    });

    test('should render the container styles by default', async ({ page }) => {
        await goToStoryWithGlobalContainer(page);

        await expectContainerStyles(page, false);
    });

    test('should remove the container styles when hidden in the global appearance', async ({ page }) => {
        await goToStoryWithGlobalContainer(page, 'hidden');

        await expectContainerStyles(page, true);
        await expect(page.getByRole('columnheader').first()).toBeVisible();
    });

    test('should let the component appearance hide the container over a visible global appearance', async ({ page }) => {
        await goToStoryWithGlobalContainer(page, 'visible');
        await expectContainerStyles(page, false);

        await updateStoryArgs(page, STORY_ID, { container: 'hidden' });

        await expectContainerStyles(page, true);
    });

    test('should let the component appearance show the container over a hidden global appearance', async ({ page }) => {
        await goToStoryWithGlobalContainer(page, 'hidden');
        await expectContainerStyles(page, true);

        await updateStoryArgs(page, STORY_ID, { container: 'visible' });

        await expectContainerStyles(page, false);
    });

    test('should restore the container styles when the component appearance is reset', async ({ page }) => {
        await goToStoryWithGlobalContainer(page, 'visible');

        await updateStoryArgs(page, STORY_ID, { container: 'hidden' });
        await expectContainerStyles(page, true);

        await updateStoryArgs(page, STORY_ID, { container: undefined });
        await expectContainerStyles(page, false);
    });
});
